package com.checkmate.checkit.erd.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class ErdActionMessage {
    private List<Map<String, Object>> actions;
}
