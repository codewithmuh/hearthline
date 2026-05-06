import secrets

from django.db import migrations, models


def _backfill_tokens(apps, schema_editor):
    Quote = apps.get_model("quotes", "Quote")
    seen: set[str] = set()
    for quote in Quote.objects.filter(public_token=""):
        token = secrets.token_urlsafe(24)
        # Vanishingly unlikely collision, but cheap to guard.
        while token in seen:
            token = secrets.token_urlsafe(24)
        seen.add(token)
        quote.public_token = token
        quote.save(update_fields=["public_token"])


class Migration(migrations.Migration):

    dependencies = [
        ("quotes", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="quote",
            name="public_token",
            field=models.CharField(default="", max_length=40),
        ),
        migrations.RunPython(_backfill_tokens, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name="quote",
            name="public_token",
            field=models.CharField(default="", max_length=40, unique=True),
        ),
    ]
