package com.ou.LMS_Spring.modules.learnings.services.interfaces;

import java.util.List;

import com.ou.LMS_Spring.modules.learnings.dtos.CertificateDownload;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.DiscussionCreateRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.ReviewCreateRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.requests.VideoProgressPatchRequest;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.CourseProgressResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.DiscussionResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.LessonProgressItemResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.ReviewResponse;
import com.ou.LMS_Spring.modules.learnings.dtos.responses.VideoProgressResponse;

public interface ILearningService {

    VideoProgressResponse patchVideoProgress(VideoProgressPatchRequest request);

    CourseProgressResponse getCourseProgress(Long courseId);

    List<LessonProgressItemResponse> getLessonProgresses(Long courseId);

    DiscussionResponse createDiscussion(DiscussionCreateRequest request);

    List<DiscussionResponse> listDiscussions(Long lessonId);

    ReviewResponse createReview(ReviewCreateRequest request);

    CertificateDownload downloadCertificate(Long courseId, String format);
}
