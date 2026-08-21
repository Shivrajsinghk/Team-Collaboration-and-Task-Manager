from django.test import TestCase
from django.contrib.auth.models import User
from teams.models import Team, TeamMembership
from sockets.models import Chats, Mention, Notification
from sockets.services import process_mentions

class ProcessMentionsTests(TestCase):
    def setUp(self):
        self.sender = User.objects.create_user(username="sender", password="password123")
        self.member = User.objects.create_user(username="member", password="password123")
        self.other_member = User.objects.create_user(username="other_member", password="password123")
        self.outsider = User.objects.create_user(username="outsider", password="password123")

        self.team = Team.objects.create(name="Backend", description="Demo", created_by=self.sender)
        TeamMembership.objects.create(user=self.sender, team=self.team, role="admin")
        TeamMembership.objects.create(user=self.member, team=self.team, role="member")
        TeamMembership.objects.create(user=self.other_member, team=self.team, role="member")
        # outsider is deliberately NOT added to the team

        self.message = Chats.objects.create(team=self.team, sender=self.sender, message="hey @member")

    def test_no_mentioned_ids_returns_empty(self):
        result = process_mentions(self.message, [])
        self.assertEqual(result, [])  
        self.assertEqual(Mention.objects.count(), 0)
        self.assertEqual(Notification.objects.count(), 0)

    def test_valid_mention_creates_mention_and_notification(self):
        process_mentions(self.message, [self.member.id])
        self.assertTrue(Mention.objects.filter(message=self.message, user=self.member).exists())
        self.assertTrue(
            Notification.objects.filter(user=self.member, notification_type="mention").exists()
        )

    def test_self_mention_excluded(self):
        process_mentions(self.message, [self.sender.id])
        self.assertEqual(Mention.objects.count(), 0)
        self.assertEqual(Notification.objects.count(), 0)

    def test_non_team_member_mention_excluded(self):
        process_mentions(self.message, [self.outsider.id])
        self.assertEqual(Mention.objects.count(), 0)
        self.assertEqual(Notification.objects.count(), 0)

    def test_duplicate_mention_does_not_duplicate_notification(self):
        process_mentions(self.message, [self.member.id])
        process_mentions(self.message, [self.member.id])
        self.assertEqual(Mention.objects.filter(message=self.message, user=self.member).count(), 1)
        self.assertEqual(
            Notification.objects.filter(user=self.member, notification_type="mention").count(), 1
        )

    def test_multiple_valid_mentions(self):
        process_mentions(self.message, [self.member.id, self.other_member.id])
        self.assertEqual(Mention.objects.filter(message=self.message).count(), 2)
        self.assertEqual(Notification.objects.filter(notification_type="mention").count(), 2)

    def test_mixed_valid_and_invalid_mentions(self):
        process_mentions(self.message, [self.member.id, self.outsider.id, self.sender.id])
        self.assertEqual(Mention.objects.filter(message=self.message).count(), 1)
        self.assertTrue(Mention.objects.filter(message=self.message, user=self.member).exists())

    def test_notification_content_references_team_and_sender(self):
        process_mentions(self.message, [self.member.id])
        notification = Notification.objects.get(user=self.member, notification_type="mention")
        self.assertIn(self.team.name.title(), notification.message)
        self.assertIn(self.sender.username.title(), notification.message)
        self.assertEqual(notification.extra_data.get("team_id"), self.team.id)
        self.assertEqual(notification.extra_data.get("message_id"), self.message.id)