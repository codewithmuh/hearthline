"""Fernet-based symmetric encryption for at-rest secrets.

The encryption key is derived from `HEARTHLINE_ENCRYPTION_KEY` (env), which
should be a Fernet key (44-char base64). Generate one with:

    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

In dev, if the env is missing, we derive a deterministic key from
`SECRET_KEY` so existing local data still round-trips. NEVER ship that
fallback to production — set `HEARTHLINE_ENCRYPTION_KEY` explicitly.
"""
from __future__ import annotations

import base64
import hashlib
import os

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.db import models


def _resolve_key() -> bytes:
    explicit = os.environ.get("HEARTHLINE_ENCRYPTION_KEY", "").strip()
    if explicit:
        return explicit.encode()
    # Dev fallback: deterministic key from SECRET_KEY so existing rows still
    # decrypt. Production hard-fails (see settings.py guard).
    raw = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return base64.urlsafe_b64encode(raw)


_FERNET: Fernet | None = None


def _fernet() -> Fernet:
    global _FERNET
    if _FERNET is None:
        _FERNET = Fernet(_resolve_key())
    return _FERNET


def encrypt(plaintext: str) -> str:
    if not plaintext:
        return ""
    return _fernet().encrypt(plaintext.encode("utf-8")).decode("ascii")


def decrypt(ciphertext: str) -> str:
    if not ciphertext:
        return ""
    try:
        return _fernet().decrypt(ciphertext.encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError):
        # Old plaintext rows from before encryption was enabled — return as-is
        # so a one-time backfill can re-save them.
        return ciphertext


class EncryptedCharField(models.TextField):
    """A CharField-like that transparently encrypts/decrypts on read/write.

    Stored as TextField because Fernet ciphertext expands ~1.5x. Indexing /
    exact-match queries don't work on this field — only equality after
    .resolved_*() unwraps it. That's fine for credential fields.
    """

    description = "Symmetrically-encrypted text"

    def from_db_value(self, value, expression, connection):  # noqa: ARG002
        if value is None:
            return value
        return decrypt(value)

    def to_python(self, value):
        if value is None or value == "":
            return value
        # Already-decrypted Python strings pass through; ciphertext on db reads
        # gets resolved by from_db_value. We assume Python-side strings are
        # already plaintext (forms, admin, code).
        return value

    def get_prep_value(self, value):
        if value is None or value == "":
            return value
        return encrypt(value)
