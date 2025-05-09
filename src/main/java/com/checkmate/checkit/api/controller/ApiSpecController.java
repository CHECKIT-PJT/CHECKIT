package com.checkmate.checkit.api.controller;

import com.checkmate.checkit.api.dto.request.ApiSpecRequest;
import com.checkmate.checkit.api.dto.response.ApiSpecResponse;
import com.checkmate.checkit.api.service.ApiSpecService;
import com.checkmate.checkit.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/api-spec/{projectId}")
@Slf4j
public class ApiSpecController {

    private final ApiSpecService apiSpecService;

    @PostMapping
    public ResponseEntity<JSONResponse<Void>> saveApiSpec(@PathVariable int projectId, @RequestBody ApiSpecRequest request,@RequestHeader("Authorization") String authorization)
    {
        log.info(request.toString());
        apiSpecService.saveApiSpec(projectId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<JSONResponse<List<ApiSpecResponse>>> getApiSpecs(@PathVariable Long projectId,@RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(JSONResponse.onSuccess(apiSpecService.getApiSpecsByProjectId(projectId)));
    }

    @GetMapping("/{apiSpecId}")
    public ResponseEntity<JSONResponse<ApiSpecResponse>> getApiSpec(@PathVariable Long projectId, @PathVariable Long apiSpecId,@RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(JSONResponse.onSuccess(apiSpecService.getApiSpecsByProjectIdandApiScepId(projectId, apiSpecId)));
    }

    @DeleteMapping("/{apiSpecId}")
    public ResponseEntity<Void> deleteApiSpec(
            @PathVariable Long projectId,
            @PathVariable Long apiSpecId,
            @RequestHeader("Authorization") String authorization
    ) {
        apiSpecService.deleteApiSpec(apiSpecId);
        return ResponseEntity.noContent().build();
    }
}