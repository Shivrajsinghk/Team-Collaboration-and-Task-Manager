from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from teams.models import Team, TeamMembership
from tasks.models import Task

class TeamAdminActionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="password123")
        self.member = User.objects.create_user(username="member", password="password123")
        self.team = Team.objects.create(name="Backend", description="Demo", created_by=self.admin)
        TeamMembership.objects.create(user=self.admin, team=self.team, role="admin")
        TeamMembership.objects.create(user=self.member, team=self.team, role="member")
        self.authenticate(self.admin)

    def authenticate(self, user):
        response = self.client.post(
            reverse("token_obtain_pair"), {"username": user.username, "password": "password123"}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_admin_can_update_team(self):
        response = self.client.patch(
            reverse("update_team", kwargs={"team_id": self.team.id}),
            {"name": "Renamed Team"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.team.refresh_from_db()
        self.assertEqual(self.team.name, "Renamed Team")

    def test_admin_can_delete_team(self):
        response = self.client.delete(reverse("delete_team", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Team.objects.filter(id=self.team.id).exists())

    def test_member_can_view_single_team(self):
        self.authenticate(self.member)
        response = self.client.get(reverse("list_team", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 200)


class LeaveTeamTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="password123")
        self.member = User.objects.create_user(username="member", password="password123")
        self.team = Team.objects.create(name="Backend", description="Demo", created_by=self.admin)
        TeamMembership.objects.create(user=self.admin, team=self.team, role="admin")
        TeamMembership.objects.create(user=self.member, team=self.team, role="member")

    def authenticate(self, user):
        response = self.client.post(
            reverse("token_obtain_pair"), {"username": user.username, "password": "password123"}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_member_can_leave_team(self):
        self.authenticate(self.member)
        response = self.client.delete(reverse("leave_team", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(TeamMembership.objects.filter(user=self.member, team=self.team).exists())

    def test_admin_cannot_leave_team(self):
        self.authenticate(self.admin)
        response = self.client.delete(reverse("leave_team", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 400)
        self.assertTrue(TeamMembership.objects.filter(user=self.admin, team=self.team).exists())

    def test_non_member_cannot_leave_team(self):
        outsider = User.objects.create_user(username="outsider", password="password123")
        self.authenticate(outsider)
        response = self.client.delete(reverse("leave_team", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 400)

    def test_leaving_unassigns_tasks(self):
        task = Task.objects.create(team=self.team, title="Task 1", created_by=self.admin)
        task.assigned_to.add(self.member)
        self.authenticate(self.member)
        self.client.delete(reverse("leave_team", kwargs={"team_id": self.team.id}))
        task.refresh_from_db()
        self.assertNotIn(self.member, task.assigned_to.all())


class RemoveUserFromTeamTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="password123")
        self.member = User.objects.create_user(username="member", password="password123")
        self.team = Team.objects.create(name="Backend", description="Demo", created_by=self.admin)
        TeamMembership.objects.create(user=self.admin, team=self.team, role="admin")
        TeamMembership.objects.create(user=self.member, team=self.team, role="member")

    def authenticate(self, user):
        response = self.client.post(
            reverse("token_obtain_pair"), {"username": user.username, "password": "password123"}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_admin_can_remove_member(self):
        self.authenticate(self.admin)
        response = self.client.delete(
            reverse("remove_user_from_team", kwargs={"team_id": self.team.id, "user_id": self.member.id})
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(TeamMembership.objects.filter(user=self.member, team=self.team).exists())

    def test_non_admin_cannot_remove_member(self):
        other = User.objects.create_user(username="other", password="password123")
        TeamMembership.objects.create(user=other, team=self.team, role="member")
        self.authenticate(self.member)
        response = self.client.delete(
            reverse("remove_user_from_team", kwargs={"team_id": self.team.id, "user_id": other.id})
        )
        self.assertEqual(response.status_code, 403)

    def test_admin_cannot_remove_self(self):
        self.authenticate(self.admin)
        response = self.client.delete(
            reverse("remove_user_from_team", kwargs={"team_id": self.team.id, "user_id": self.admin.id})
        )
        self.assertEqual(response.status_code, 400)

    def test_cannot_remove_non_member(self):
        outsider = User.objects.create_user(username="outsider", password="password123")
        self.authenticate(self.admin)
        response = self.client.delete(
            reverse("remove_user_from_team", kwargs={"team_id": self.team.id, "user_id": outsider.id})
        )
        self.assertEqual(response.status_code, 400)


class PromoteDemoteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="password123")
        self.member = User.objects.create_user(username="member", password="password123")
        self.team = Team.objects.create(name="Backend", description="Demo", created_by=self.admin)
        TeamMembership.objects.create(user=self.admin, team=self.team, role="admin")
        TeamMembership.objects.create(user=self.member, team=self.team, role="member")

    def authenticate(self, user):
        response = self.client.post(
            reverse("token_obtain_pair"), {"username": user.username, "password": "password123"}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_admin_can_promote_member(self):
        self.authenticate(self.admin)
        response = self.client.patch(
            reverse("promote_member_to_admin", kwargs={"team_id": self.team.id, "user_id": self.member.id})
        )
        self.assertEqual(response.status_code, 200)
        membership = TeamMembership.objects.get(user=self.member, team=self.team)
        self.assertEqual(membership.role, "admin")

    def test_non_admin_cannot_promote(self):
        other = User.objects.create_user(username="other", password="password123")
        TeamMembership.objects.create(user=other, team=self.team, role="member")
        self.authenticate(self.member)
        response = self.client.patch(
            reverse("promote_member_to_admin", kwargs={"team_id": self.team.id, "user_id": other.id})
        )
        self.assertEqual(response.status_code, 403)

    def test_max_admin_limit_enforced(self):
        u2 = User.objects.create_user(username="u2", password="password123")
        u3 = User.objects.create_user(username="u3", password="password123")
        u4 = User.objects.create_user(username="u4", password="password123")
        TeamMembership.objects.create(user=u2, team=self.team, role="admin")
        TeamMembership.objects.create(user=u3, team=self.team, role="admin")
        TeamMembership.objects.create(user=u4, team=self.team, role="member")
        self.authenticate(self.admin)
        response = self.client.patch(
            reverse("promote_member_to_admin", kwargs={"team_id": self.team.id, "user_id": u4.id})
        )
        self.assertEqual(response.status_code, 400)

    def test_cannot_promote_existing_admin(self):
        self.authenticate(self.admin)
        response = self.client.patch(
            reverse("promote_member_to_admin", kwargs={"team_id": self.team.id, "user_id": self.admin.id})
        )
        self.assertEqual(response.status_code, 400)

    def test_admin_can_demote_another_admin(self):
        TeamMembership.objects.filter(user=self.member, team=self.team).update(role="admin")
        self.authenticate(self.admin)
        response = self.client.patch(
            reverse("demote_admin_to_member", kwargs={"team_id": self.team.id, "user_id": self.member.id})
        )
        self.assertEqual(response.status_code, 200)
        membership = TeamMembership.objects.get(user=self.member, team=self.team)
        self.assertEqual(membership.role, "member")

    def test_sole_admin_cannot_demote_self(self):
        self.authenticate(self.admin)
        response = self.client.patch(
            reverse("demote_admin_to_member", kwargs={"team_id": self.team.id, "user_id": self.admin.id})
        )
        self.assertEqual(response.status_code, 400)

    def test_cannot_demote_existing_member(self):
        self.authenticate(self.admin)
        response = self.client.patch(
            reverse("demote_admin_to_member", kwargs={"team_id": self.team.id, "user_id": self.member.id})
        )
        self.assertEqual(response.status_code, 400)


class MembersListAndDetailsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="password123")
        self.member = User.objects.create_user(username="member", password="password123")
        self.outsider = User.objects.create_user(username="outsider", password="password123")
        self.team = Team.objects.create(name="Backend", description="Demo", created_by=self.admin)
        TeamMembership.objects.create(user=self.admin, team=self.team, role="admin")
        TeamMembership.objects.create(user=self.member, team=self.team, role="member")

    def authenticate(self, user):
        response = self.client.post(
            reverse("token_obtain_pair"), {"username": user.username, "password": "password123"}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_member_can_list_members(self):
        self.authenticate(self.member)
        response = self.client.get(reverse("members_list", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_outsider_cannot_list_members(self):
        self.authenticate(self.outsider)
        response = self.client.get(reverse("members_list", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 403)

    def test_member_can_view_member_details(self):
        self.authenticate(self.member)
        response = self.client.get(
            reverse("member_details", kwargs={"team_id": self.team.id, "member_id": self.admin.id})
        )
        self.assertEqual(response.status_code, 200)

    def test_outsider_cannot_view_member_details(self):
        self.authenticate(self.outsider)
        response = self.client.get(
            reverse("member_details", kwargs={"team_id": self.team.id, "member_id": self.admin.id})
        )
        self.assertEqual(response.status_code, 403)

    def test_cannot_view_details_of_non_team_member(self):
        self.authenticate(self.admin)
        response = self.client.get(
            reverse("member_details", kwargs={"team_id": self.team.id, "member_id": self.outsider.id})
        )
        self.assertEqual(response.status_code, 403)


class TeamPresenceIDORTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="password123")
        self.outsider = User.objects.create_user(username="outsider", password="password123")
        self.team = Team.objects.create(name="Backend", description="Demo", created_by=self.admin)
        TeamMembership.objects.create(user=self.admin, team=self.team, role="admin")

    def authenticate(self, user):
        response = self.client.post(
            reverse("token_obtain_pair"), {"username": user.username, "password": "password123"}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_member_can_view_presence(self):
        self.authenticate(self.admin)
        response = self.client.get(reverse("team_members_presence", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 200)

    def test_outsider_cannot_view_presence(self):
        self.authenticate(self.outsider)
        response = self.client.get(reverse("team_members_presence", kwargs={"team_id": self.team.id}))
        self.assertEqual(response.status_code, 403)
        