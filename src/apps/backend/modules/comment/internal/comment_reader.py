from typing import List

from bson import ObjectId
from bson.errors import InvalidId

from modules.comment.errors import CommentNotFoundError
from modules.comment.internal.comment_util import CommentUtil
from modules.comment.internal.store.comment_repository import CommentRepository
from modules.comment.types import Comment, GetCommentParams, GetTaskCommentsParams


class CommentReader:
    def __init__(self):
        self.repository = CommentRepository()

    def get_comment_by_id(self, params: GetCommentParams) -> Comment:
        try:
            comment_id = ObjectId(params.comment_id)
        except InvalidId:
            raise CommentNotFoundError()

        comment_bson = self.repository.collection().find_one(
            {"_id": comment_id, "task_id": params.task_id, "active": True}
        )

        if not comment_bson:
            raise CommentNotFoundError()

        comment = CommentUtil.convert_comment_bson_to_comment(comment_bson)

        # Optional: authorization checks can be added here
        if comment.account_id != params.account_id:
            # keep behavior same as current services (no-op) or add additional checks via TaskService
            pass

        return comment

    def get_comments_by_task_id(self, params: GetTaskCommentsParams) -> List[Comment]:
        query = {"task_id": params.task_id, "active": True}

        cursor = self.repository.collection().find(query).sort("created_at", -1)

        comments = [CommentUtil.convert_comment_bson_to_comment(bson_data) for bson_data in cursor]

        return comments
