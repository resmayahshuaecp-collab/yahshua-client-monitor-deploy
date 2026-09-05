import getpass

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from accounts.models import Role, UserProfile


class Command(BaseCommand):
    help = (
        "Assign a role to an existing user and optionally set a new password. "
        "Idempotent. Safe to run in production."
    )

    def add_arguments(self, parser):
        parser.add_argument("identifier", help="Email or username of the user")
        parser.add_argument(
            "--role",
            default=Role.ADMIN,
            choices=[r.value for r in Role],
            help="Role to assign (default: ADMIN)",
        )
        parser.add_argument(
            "--display-name",
            default=None,
            help="Optional display name to set on the profile",
        )
        parser.add_argument(
            "--password",
            default=None,
            help=(
                "New password. If omitted you are prompted for one. "
                "Pass --no-password to leave the password unchanged."
            ),
        )
        parser.add_argument(
            "--no-password",
            action="store_true",
            help="Leave the existing password unchanged",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        identifier = options["identifier"]
        role = options["role"]

        user = User.objects.filter(username=identifier).first()
        if user is None:
            user = User.objects.filter(email=identifier).first()
        if user is None:
            self.stderr.write(f"No user found matching: {identifier}")
            self.stdout.write("Existing users:")
            for u in User.objects.all():
                self.stdout.write(
                    f"  id={u.pk} username={u.get_username()} email={u.email}"
                )
            raise CommandError("User not found.")

        # --- password ---
        if not options["no_password"]:
            password = options["password"]
            if not password:
                password = getpass.getpass("New password: ")
                confirm = getpass.getpass("Confirm password: ")
                if password != confirm:
                    raise CommandError("Passwords did not match.")
            if len(password) < 12:
                raise CommandError("Password must be at least 12 characters.")
            user.set_password(password)
            user.save(update_fields=["password"])
            self.stdout.write("Password updated.")
        else:
            self.stdout.write("Password left unchanged.")

        # --- role ---
        defaults = {"role": role}
        if options["display_name"]:
            defaults["display_name"] = options["display_name"]

        profile, created = UserProfile.objects.update_or_create(
            user=user, defaults=defaults
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Profile {'created' if created else 'updated'}: "
                f"{user.get_username()} -> {profile.role}"
            )
        )