package com.checkmate.checkit.erd.controller;

import com.checkmate.checkit.erd.dto.request.ErdSnapshotRequest;
import com.checkmate.checkit.erd.dto.response.ErdSnapshotResponse;
import com.checkmate.checkit.erd.service.ErdService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/erd")
@RequiredArgsConstructor
@Slf4j
public class ErdController {

    private final ErdService erdService;

    @GetMapping("/{projectId}")
    public ResponseEntity<ErdSnapshotResponse> getErd(@PathVariable int projectId, @RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(erdService.getErdByProjectId(projectId));
    }

    @PostMapping("/{projectId}")
    public ResponseEntity<Void> saveErd(@PathVariable int projectId, @RequestBody ErdSnapshotRequest dto,@RequestHeader("Authorization") String authorization) {
        log.info(dto.toString());
        erdService.saveErd(projectId, dto);
        return ResponseEntity.ok().build();
    }
}
