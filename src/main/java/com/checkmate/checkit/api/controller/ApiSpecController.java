package com.checkmate.checkit.api.controller;

import com.checkmate.checkit.api.dto.request.ApiSpecRequest;
import com.checkmate.checkit.api.dto.response.ApiSpecResponse;
import com.checkmate.checkit.api.service.ApiSpecService;
import com.checkmate.checkit.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/api-spec/{projectId}")
public class ApiSpecController {

    private final ApiSpecService apiSpecService;

    @PostMapping
    public ResponseEntity<JSONResponse<Void>> saveApiSpec(
            @PathVariable int projectId,
            @RequestBody ApiSpecRequest request
    ) {
        apiSpecService.saveApiSpec(projectId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<JSONResponse<List<ApiSpecResponse>>> getApiSpecs(@PathVariable Long projectId) {
        return ResponseEntity.ok(JSONResponse.onSuccess(apiSpecService.getApiSpecsByProjectId(projectId)));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteApiSpec(
            @PathVariable Long projectId,
            @PathVariable Long specId
    ) {
        apiSpecService.deleteApiSpec(specId);
        return ResponseEntity.noContent().build();
    }
}