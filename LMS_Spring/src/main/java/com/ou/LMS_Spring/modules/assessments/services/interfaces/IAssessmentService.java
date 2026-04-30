package com.ou.LMS_Spring.modules.assessments.services.interfaces;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.modules.assessments.dtos.requests.AssignmentCreateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.AssignmentUpdateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorGradeRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizCreateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizQuestionUpsertRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizSubmitRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizUpdateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssessmentQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssignmentResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssignmentSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorSubmissionItemResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.QuizSubmitResponse;

public interface IAssessmentService {

    // ---- Student ----
    AssessmentQuizResponse getQuiz(Long id);

    QuizSubmitResponse submitQuiz(QuizSubmitRequest request);

    AssignmentSubmitResponse submitAssignment(Long lessonId, MultipartFile file, String note);

    // ---- Instructor grading ----
    List<InstructorSubmissionItemResponse> instructorSubmissions();

    InstructorSubmissionItemResponse gradeSubmission(InstructorGradeRequest request);

    // ---- Instructor quiz CRUD ----
    InstructorQuizResponse getInstructorQuizByLesson(Long lessonId);

    InstructorQuizResponse createQuiz(QuizCreateRequest request);

    InstructorQuizResponse updateQuiz(Long quizId, QuizUpdateRequest request);

    void deleteQuiz(Long quizId);

    InstructorQuizResponse addQuestion(Long quizId, QuizQuestionUpsertRequest request);

    InstructorQuizResponse updateQuestion(Long quizId, Long questionId, QuizQuestionUpsertRequest request);

    InstructorQuizResponse deleteQuestion(Long quizId, Long questionId);

    // ---- Instructor assignment CRUD ----
    AssignmentResponse getInstructorAssignmentByLesson(Long lessonId);

    AssignmentResponse createAssignment(AssignmentCreateRequest request);

    AssignmentResponse updateAssignment(Long assignmentId, AssignmentUpdateRequest request);

    void deleteAssignment(Long assignmentId);
}
