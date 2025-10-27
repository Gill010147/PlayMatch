package com.playmatch.playmatch.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resolvedUploadDir = "file:" + uploadDir + "/";
        log.info("Configuring resource handler for /uploads/** to {}", resolvedUploadDir);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resolvedUploadDir);
    }
}
