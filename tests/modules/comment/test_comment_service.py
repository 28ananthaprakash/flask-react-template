from tests.modules.comment.base_test_comment import BaseTestComment

class TestCommentService(BaseTestComment):
    def setUp(self) -> None:
        super().setUp()
        self.account = self.create_test_account()
        self.task = self.create_test_task(account_id=self.account.id)

    def test_comment_service_setup(self) -> None:
        # Basic test to ensure the service can be imported and used
        assert self.account is not None
        assert self.task is not None
        assert self.account.id is not None
        assert self.task.id is not None
