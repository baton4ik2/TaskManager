package com.taskmanager.config;

import com.taskmanager.filter.JwtAuthenticationFilter;
import com.taskmanager.service.OAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2UserService oAuth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Разрешаем OPTIONS для CORS
                        .requestMatchers("/auth/login", "/auth/register", "/h2-console/**").permitAll() // Разрешаем только login и register без аутентификации
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll() // Разрешаем OAuth2 endpoints
                        .requestMatchers("/auth/me").authenticated() // /auth/me требует аутентификации
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserService)
                        )
                        .successHandler(oauth2SuccessHandler())
                        .failureHandler(oauth2FailureHandler())
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/login/oauth2/code/*")
                        )
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions().disable()); // Для H2 console

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationSuccessHandler oauth2SuccessHandler() {
        return new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                Authentication authentication) throws IOException {
                try {
                    log.info("OAuth2 authentication success. Authentication type: {}", authentication.getClass().getName());
                    if (authentication instanceof OAuth2AuthenticationToken) {
                        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                        OAuth2User oauth2User = oauthToken.getPrincipal();
                        String provider = oauthToken.getAuthorizedClientRegistrationId();
                        
                        log.info("OAuth2 provider: {}, User attributes: {}", provider, oauth2User.getAttributes().keySet());
                        
                        // Получаем пользователя из базы данных
                        com.taskmanager.model.User user = oAuth2UserService.getUserFromOAuth2(oauth2User, provider);
                        String token = oAuth2UserService.generateJwtToken(user);
                        
                        log.info("OAuth2 user found/created: {}", user.getUsername());
                        
                        // Перенаправляем на frontend с токеном и информацией о пользователе
                        String frontendUrl = "http://localhost:3001/auth/callback?token=" + token 
                            + "&username=" + java.net.URLEncoder.encode(user.getUsername(), "UTF-8")
                            + "&email=" + java.net.URLEncoder.encode(user.getEmail() != null ? user.getEmail() : "", "UTF-8")
                            + "&role=" + java.net.URLEncoder.encode(user.getRole().name(), "UTF-8")
                            + "&userId=" + user.getId();
                        response.sendRedirect(frontendUrl);
                    } else {
                        log.warn("Authentication is not OAuth2AuthenticationToken: {}", authentication.getClass().getName());
                        response.sendRedirect("http://localhost:3001/login");
                    }
                } catch (Exception e) {
                    log.error("OAuth2 authentication success handler error", e);
                    response.sendRedirect("http://localhost:3001/login?error=oauth2_failed&message=" + 
                        java.net.URLEncoder.encode(e.getMessage(), "UTF-8"));
                }
            }
        };
    }

    @Bean
    public AuthenticationFailureHandler oauth2FailureHandler() {
        return new AuthenticationFailureHandler() {
            @Override
            public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                                org.springframework.security.core.AuthenticationException exception) throws IOException {
                log.error("OAuth2 authentication failure", exception);
                String errorMessage = exception.getMessage() != null ? exception.getMessage() : "OAuth2 authentication failed";
                response.sendRedirect("http://localhost:3001/login?error=oauth2_failed&message=" + 
                    java.net.URLEncoder.encode(errorMessage, "UTF-8"));
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3001", "http://frontend:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Кэширование preflight запросов на 1 час
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

