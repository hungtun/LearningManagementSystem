package com.ou.LMS_Spring.modules.assessments.services.interfaces;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorAssignmentCreateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorAssignmentUpdateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorGradeRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorQuizCreateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.InstructorQuizUpdateRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizQuestionRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.requests.QuizSubmitRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssessmentQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.AssignmentSubmitResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorAssignmentResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorQuizResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.InstructorSubmissionItemResponse;
import com.ou.LMS_Spring.modules.assessments.dtos.responses.QuizSubmitResponse;

public interface IAssessmentService {
    AssessmentQuizResponse getQuiz(Long id);

    AssessmentQuizResponse getQuizByLessonForStudent(Long lessonId);

    QuizSubmitResponse submitQuiz(QuizSubmitRequest request);

    AssignmentSubmitResponse submitAssignment(Long lessonId, MultipartFile file, String note);

    InstructorAssignmentResponse getAssignmentByLessonForStudent(Long lessonId);

    ResponseEntity<Resource> downloadMyAssignmentSubmission(Long lessonId);

    List<InstructorSubmissionItemResponse> instructorSubmissions();

    ResponseEntity<Resource> downloadAssignmentSubmissionForInstructor(Long submissionId);

    InstructorSubmissionItemResponse gradeSubmission(InstructorGradeRequest request);

    // Instructor quiz CRUD
    InstructorQuizResponse getQuizByLesson(Long lessonId);

    InstructorQuizResponse createQuiz(InstructorQuizCreateRequest request);

    InstructorQuizResponse updateQuiz(Long quizId, InstructorQuizUpdateRequest request);

    void deleteQuiz(Long quizId);

    InstructorQuizResponse addQuestion(Long quizId, QuizQuestionRequest request);

    InstructorQuizResponse updateQuestion(Long quizId, Long questionId, QuizQuestionRequest request);

    InstructorQuizResponse deleteQuestion(Long quizId, Long questionId);

    // Instructor assignment CRUD
    InstructorAssignmentResponse getAssignmentByLesson(Long lessonId);

    InstructorAssignmentResponse createAssignment(InstructorAssignmentCreateRequest request);

    InstructorAssignmentResponse updateAssignment(Long assignmentId, InstructorAssignmentUpdateRequest request);

    void deleteAssignment(Long assignmentId);
}
