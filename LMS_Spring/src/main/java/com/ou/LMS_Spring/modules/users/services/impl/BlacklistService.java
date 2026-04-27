package com.ou.LMS_Spring.modules.users.services.impl;

import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.ou.LMS_Spring.Entities.BlacklistedToken;
import com.ou.LMS_Spring.Services.JwtService;
import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.modules.users.dtos.requests.BlacklistTokenRequest;
import com.ou.LMS_Spring.modules.users.dtos.responses.BlacklistTokenResponse;
import com.ou.LMS_Spring.modules.users.repositories.BlacklistedTokenRepository;
import com.ou.LMS_Spring.resources.ErrorResource;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlacklistService {
    
    private static final Logger logger = LoggerFactory.getLogger(BlacklistService.class);
    private static final String CODE = "code";
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtService jwtService;

    public BlacklistTokenResponse create(BlacklistTokenRequest request){
        try {
            if(blacklistedTokenRepository.existsByToken(request.getToken())){
                throw tokenAlreadyBlacklisted();
            }
            Claims claims = jwtService.getAllClaimsFromToken(request.getToken());

            Long userId = Long.valueOf(claims.getSubject());
            Date expiryDate = claims.getExpiration();
            BlacklistedToken blacklistedToken = new BlacklistedToken();
            blacklistedToken.setToken(request.getToken());
            blacklistedToken.setUserId(userId);
            blacklistedToken.setExpiryDate(expiryDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
            BlacklistedToken saved =  blacklistedTokenRepository.save(blacklistedToken);

            return new BlacklistTokenResponse(
                saved.getId(),
                saved.getUserId(),
                "Token has been blacklisted successfully",
                saved.getToken()
            );
                    
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("Invalid token for blacklist: {}", e.getMessage());
            throw invalidToken();
        }
    }

    private ApiBusinessException tokenAlreadyBlacklisted() {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "TOKEN_ALREADY_BLACKLISTED");
        errors.put("message", "Token is already blacklisted");
        return new ApiBusinessException(HttpStatus.CONFLICT,
                new ErrorResource("Blacklist failed", errors));
    }

    private ApiBusinessException invalidToken() {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "INVALID_TOKEN");
        errors.put("message", "Token is invalid or malformed");
        return new ApiBusinessException(HttpStatus.UNPROCESSABLE_CONTENT,
                new ErrorResource("Blacklist failed", errors));
    }
}
