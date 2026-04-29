package com.ou.LMS_Spring.modules.assessments.services.interfaces;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorGradeRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizSubmitRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssessmentQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssignmentSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorSubmissionItemResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.QuizSubmitResponse;

public interface IAssessmentService {
    AssessmentQuizResponse getQuiz(Long id);

    QuizSubmitResponse submitQuiz(QuizSubmitRequest request);

    AssignmentSubmitResponse submitAssignment(Long lessonId, MultipartFile file, String note);

    List<InstructorSubmissionItemResponse> instructorSubmissions();

    InstructorSubmissionItemResponse gradeSubmission(InstructorGradeRequest request);
}
