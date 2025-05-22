package com.checkmate.checkit.functional.controller;

import com.checkmate.checkit.functional.dto.request.FunctionalSpecCreateRequest;
import com.checkmate.checkit.functional.dto.request.FunctionalSpecUpdateRequest;
import com.checkmate.checkit.functional.dto.response.FunctionalSpecResponse;
import com.checkmate.checkit.functional.service.FunctionalSpecService;
import com.checkmate.checkit.global.code.SuccessCode;
import com.checkmate.checkit.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/functional-spec")
@RequiredArgsConstructor
public class FunctionalSpecController {

    private final FunctionalSpecService functionalSpecService;

    @GetMapping("/{projectId}")
    public ResponseEntity<JSONResponse<List<FunctionalSpecResponse>>> getFunctionalSpecs(@PathVariable int projectId, @RequestHeader("Authorization") String authorization){
        List<FunctionalSpecResponse> specList = functionalSpecService.getSpecsByProject(projectId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.GET_FUNCTIONAL_SPEC_SUCCESS, specList));
    }

    @PostMapping
    public ResponseEntity<JSONResponse<FunctionalSpecResponse>> createFunctionalSpec(@RequestBody FunctionalSpecCreateRequest request, @RequestHeader("Authorization") String authorization){
        FunctionalSpecResponse response = functionalSpecService.createSpec(request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.CREATE_FUNCTIONAL_SPEC_SUCCESS, response));
    }


    @PutMapping
    public ResponseEntity<JSONResponse<FunctionalSpecResponse>> updateSpec(@RequestBody FunctionalSpecUpdateRequest request) {
        FunctionalSpecResponse response = functionalSpecService.updateSpec(request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.UPDATE_FUNCTIONAL_SPEC_SUCCESS, response));
    }

    @DeleteMapping("/{specId}")
    public ResponseEntity<JSONResponse<Void>> deleteSpec(@PathVariable int specId) {
        functionalSpecService.deleteSpec(specId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.DELETE_FUNCTIONAL_SPEC_SUCCESS));
    }
}
