package com.checkmate.checkit.socket;


import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class PresenceTracker {

    private final ConcurrentMap<String, Set<String>> presenceMap = new ConcurrentHashMap<>();

    public void enter(String resourceId, String userName) {
        presenceMap.putIfAbsent(resourceId, ConcurrentHashMap.newKeySet());
        presenceMap.get(resourceId).add(userName);
    }

    public void leave(String resourceId, String userName) {
        Set<String> users = presenceMap.get(resourceId);
        if (users != null) {
            users.remove(userName);
            if (users.isEmpty()) {
                presenceMap.remove(resourceId);
            }
        }
    }

    public Set<String> getUsers(String resourceId) {
        return presenceMap.getOrDefault(resourceId, Collections.emptySet());
    }
}