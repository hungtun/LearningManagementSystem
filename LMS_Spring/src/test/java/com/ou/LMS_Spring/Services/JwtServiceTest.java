package com.ou.LMS_Spring.Services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Proxy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.ou.LMS_Spring.config.JwtConfig;
import com.ou.LMS_Spring.modules.users.repositories.BlacklistedTokenRepository;

class JwtServiceTest {

    private static final String SECRET_KEY = "this-is-a-very-long-secret-key-for-lms-unit-testing-purpose-only";
    private static final String ISSUER = "lms-service";

    private BlacklistedTokenRepository blacklistedTokenRepository;

    private JwtConfig jwtConfig;
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtConfig = new JwtConfig();
        ReflectionTestUtils.setField(jwtConfig, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtConfig, "issuer", ISSUER);
        ReflectionTestUtils.setField(jwtConfig, "expirationTime", 3600000L);

        blacklistedTokenRepository = buildRepositoryProxy(false);
        jwtService = new JwtService(jwtConfig, blacklistedTokenRepository);
    }

    @Test
    void generateTokenAndExtractClaims_shouldReturnCorrectUserData() {
        String token = jwtService.generateToken(7L, "student@lms.com");

        assertTrue(jwtService.isTokenFormatValid(token));
        assertEquals("7", jwtService.getUserIdFromJwt(token));
        assertEquals("student@lms.com", jwtService.getEmailFromJwt(token));
        assertTrue(jwtService.isIssuerToken(token));
    }

    @Test
    void isTokenFormatValid_shouldReturnFalseForInvalidToken() {
        assertFalse(jwtService.isTokenFormatValid("invalid-token"));
    }

    @Test
    void isSignatureValid_shouldReturnFalseForTamperedToken() {
        String token = jwtService.generateToken(1L, "admin@lms.com");
        String tamperedToken = token.substring(0, token.length() - 1) + "x";

        assertFalse(jwtService.isSignatureValid(tamperedToken));
    }

    @Test
    void isTokenExpired_shouldReturnTrueWhenTokenIsAlreadyExpired() {
        ReflectionTestUtils.setField(jwtConfig, "expirationTime", -1000L);
        JwtService expiredTokenService = new JwtService(jwtConfig, blacklistedTokenRepository);
        String expiredToken = expiredTokenService.generateToken(5L, "expired@lms.com");

        assertTrue(expiredTokenService.isTokenExpired(expiredToken));
    }

    @Test
    void isTokenBlacklisted_shouldDelegateToRepository() {
        String blacklistedToken = "blacklisted-token";
        JwtService jwtServiceWithBlacklistedToken = new JwtService(jwtConfig, buildRepositoryProxy(true));

        assertTrue(jwtServiceWithBlacklistedToken.isTokenBlacklisted(blacklistedToken));
    }

    private BlacklistedTokenRepository buildRepositoryProxy(boolean isBlacklisted) {
        return (BlacklistedTokenRepository) Proxy.newProxyInstance(
                BlacklistedTokenRepository.class.getClassLoader(),
                new Class<?>[] { BlacklistedTokenRepository.class },
                (proxy, method, args) -> {
                    if ("existsByToken".equals(method.getName())) {
                        return isBlacklisted;
                    }
                    if ("toString".equals(method.getName())) {
                        return "BlacklistedTokenRepositoryTestProxy";
                    }
                    if ("hashCode".equals(method.getName())) {
                        return System.identityHashCode(proxy);
                    }
                    if ("equals".equals(method.getName())) {
                        return proxy == args[0];
                    }
                    throw new UnsupportedOperationException("Method not required in this unit test: " + method.getName());
                });
    }
}