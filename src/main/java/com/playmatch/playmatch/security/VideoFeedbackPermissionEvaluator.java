package com.playmatch.playmatch.security;

import com.playmatch.playmatch.service.VideoFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
public class VideoFeedbackPermissionEvaluator implements PermissionEvaluator {

    private final VideoFeedbackService videoFeedbackService;

    @Override
    public boolean hasPermission(
            Authentication authentication,
            Object targetDomainObject,
            Object permission) {

        if ((authentication == null) || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userEmail = userDetails.getUsername();

        if ("VideoFeedback".equals(targetDomainObject)) {
            Long videoId = (Long) permission;
            return videoFeedbackService.isUploader(videoId, userEmail);
        } else if ("VideoComment".equals(targetDomainObject)) {
            Long commentId = (Long) permission;
            return videoFeedbackService.isCommentAuthor(commentId, userEmail);
        }
        return false;
    }

    @Override
    public boolean hasPermission(
            Authentication authentication,
            Serializable targetId,
            String targetType,
            Object permission) {

        if ((authentication == null) || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userEmail = userDetails.getUsername();

        if ("VideoFeedback".equals(targetType)) {
            Long videoId = (Long) targetId;
            return videoFeedbackService.isUploader(videoId, userEmail);
        } else if ("VideoComment".equals(targetType)) {
            Long commentId = (Long) targetId;
            return videoFeedbackService.isCommentAuthor(commentId, userEmail);
        }
        return false;
    }
}
