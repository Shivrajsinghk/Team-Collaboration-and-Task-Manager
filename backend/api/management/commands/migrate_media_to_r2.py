import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from api.models import UserProfile
from sockets.models import Chats, PersonalMessage

class Command(BaseCommand):
    help = "Migrate existing local media files to R2, preserving the same storage key. Does not touch the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List what would be migrated without uploading anything.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        local_media_root = settings.BASE_DIR / "media"

        sources = [
            ("UserProfile.profile_picture", UserProfile.objects.exclude(profile_picture=""), "profile_picture"),
            ("UserProfile.resume", UserProfile.objects.exclude(resume=""), "resume"),
            ("Chats.attachment", Chats.objects.exclude(attachment=""), "attachment"),
            ("PersonalMessage.attachment", PersonalMessage.objects.exclude(attachment=""), "attachment"),
        ]

        log_lines = []
        total_migrated = 0
        total_skipped_already_present = 0
        total_missing_locally = 0
        total_bytes = 0

        for label, queryset, field_name in sources:
            self.stdout.write(f"\n--- {label} ---")
            for obj in queryset:
                field = getattr(obj, field_name)
                if not field:
                    continue

                key = field.name  
                local_path = local_media_root / key

                if default_storage.exists(key):
                    total_skipped_already_present += 1
                    continue

                if not local_path.exists():
                    msg = f"MISSING LOCALLY: {label} id={obj.id} key={key} (no local file found, cannot migrate)"
                    self.stdout.write(self.style.WARNING(msg))
                    log_lines.append(msg)
                    total_missing_locally += 1
                    continue

                size = local_path.stat().st_size
                total_bytes += size

                if dry_run:
                    msg = f"WOULD MIGRATE: {label} id={obj.id} key={key} ({size} bytes)"
                    self.stdout.write(msg)
                    log_lines.append(msg)
                else:
                    with open(local_path, "rb") as f:
                        default_storage.save(key, ContentFile(f.read()))
                    msg = f"MIGRATED: {label} id={obj.id} key={key} ({size} bytes)"
                    self.stdout.write(self.style.SUCCESS(msg))
                    log_lines.append(msg)
                    total_migrated += 1

        summary = (
            f"\n=== SUMMARY ===\n"
            f"Dry run: {dry_run}\n"
            f"Migrated: {total_migrated}\n"
            f"Already in R2 (skipped): {total_skipped_already_present}\n"
            f"Missing locally (could not migrate): {total_missing_locally}\n"
            f"Total bytes {'that would be' if dry_run else ''} transferred: {total_bytes}\n"
        )
        self.stdout.write(self.style.SUCCESS(summary))
        log_lines.append(summary)

        log_path = settings.BASE_DIR / "r2_migration_log.txt"
        with open(log_path, "a") as f:
            f.write("\n".join(log_lines) + "\n")
        self.stdout.write(f"Log written to {log_path}")
        