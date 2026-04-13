// package com.ou.LMS_Spring.helpers;

// import java.io.IOException;
// import java.util.HashMap;
// import java.util.Map;

// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;

// import com.ou.LMS_Spring.Services.JwtService;
// import com.ou.LMS_Spring.modules.users.services.impl.CustomUserDetailsService;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import jakarta.validation.constraints.NotNull;
// import lombok.NonNull;
// import lombok.RequiredArgsConstructor;
// import tools.jackson.databind.ObjectMapper;

// @Component
// @RequiredArgsConstructor
// public class JwtAuthFilter extends OncePerRequestFilter {
//     private final JwtService jwtService;
//     private final CustomUserDetailsService customUserDetailsService;
//     private final ObjectMapper objectMapper;

//     // whitelist login / register (no JWT)
//     @Override
//     protected boolean shouldNotFilter(@NonNull HttpServletRequest request) throws ServletException {
//         String path = request.getRequestURI();
//         return path.startsWith("/api/auth/login")
//         || path.startsWith("/api/auth/register");
//     }

//     @Override
//     public void doFilterInternal(
//         @NonNull HttpServletRequest request,
//         @NonNull HttpServletResponse response,
//         @NonNull FilterChain filterChain
//     ) throws ServletException, IOException{
//         try{
//             final String authHeader = request.getHeader("Authorization");
//             final String jwt;
//             final String userId;
//             if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//                 sendErrorResponse(
//                         response,
//                         request,
//                         HttpServletResponse.SC_UNAUTHORIZED,
//                         "Unauthorized",
//                         "Missing or invalid Authorization header");
//                 return;
//             }

//             jwt = authHeader.substring(7);
            
//             if (!jwtService.isTokenFormatValid(jwt)) {
//                     sendErrorResponse(response, 
//                         request, 
//                         HttpServletResponse.SC_UNAUTHORIZED, 
//                         "Unauthorized", 
//                         "Invalid token format"
//                     );
//                     return;
//             }

//             if (!jwtService.isSignatureValid(jwt)) {
//                 sendErrorResponse(response, 
//                     request, 
//                     HttpServletResponse.SC_UNAUTHORIZED, 
//                     "Unauthorized", 
//                     "Invalid token signature"
//                 );
//                 return;
//             }

//             if (!jwtService.isIssuerToken(jwt)) {
//                 sendErrorResponse(
//                         response,
//                         request,
//                         HttpServletResponse.SC_UNAUTHORIZED,
//                         "Unauthorized",
//                         "Invalid token issuer");
//                 return;
//             }

//             if (jwtService.isTokenExpired(jwt)) {
//                 sendErrorResponse(
//                         response,
//                         request,
//                         HttpServletResponse.SC_UNAUTHORIZED,
//                         "Unauthorized",
//                         "Token has expired");
//                 return;
//             }

//             userId = jwtService.getUserIdFromJwt(jwt);
//             if (userId == null || userId.isBlank()) {
//                 sendErrorResponse(
//                         response,
//                         request,
//                         HttpServletResponse.SC_UNAUTHORIZED,
//                         "Unauthorized",
//                         "Invalid token subject");
//                 return;
//             }

//             // Always set JWT authentication when the token is valid. Spring Security often
//             // pre-populates an AnonymousAuthenticationToken (not null), which previously
//             // skipped this block and left requests unauthenticated -> 401/403 on /api/users/me.
//             UserDetails userDetails = customUserDetailsService.loadUserByUsername(userId);
//             String emailFromToken = jwtService.getEmailFromJwt(jwt);
//             if (emailFromToken == null || !emailFromToken.equals(userDetails.getUsername())) {
//                 sendErrorResponse(
//                         response,
//                         request,
//                         HttpServletResponse.SC_UNAUTHORIZED,
//                         "Unauthorized",
//                         "Token email does not match user details");
//                 return;
//             }

//             UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                     userDetails,
//                     null,
//                     userDetails.getAuthorities());

//             authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

//             SecurityContextHolder.getContext().setAuthentication(authToken);

//             filterChain.doFilter(request, response);
//         } catch (ServletException | IOException e) {
//             sendErrorResponse(
//                     response,
//                     request,
//                     HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
//                     "Internal Server Error",
//                     e.getMessage());
//         }
//     }

//     private void sendErrorResponse(
//         @NotNull HttpServletResponse response,
//         @NotNull HttpServletRequest request,
//         int statusCode,
//         String error,
//         String message
//     ) throws IOException {
//         response.setStatus(statusCode);
//         response.setContentType("application/json; charset=UTF-8");

//         Map<String, Object> errorResponse = new HashMap<>();

//         errorResponse.put("timestamp", System.currentTimeMillis());
//         errorResponse.put("status", statusCode);
//         errorResponse.put("error", error);
//         errorResponse.put("message", message);
//         errorResponse.put("path", request.getRequestURI());

//         String jsonResponse = objectMapper.writeValueAsString(errorResponse);

//         response.getWriter().write(jsonResponse);
//     }
// }
