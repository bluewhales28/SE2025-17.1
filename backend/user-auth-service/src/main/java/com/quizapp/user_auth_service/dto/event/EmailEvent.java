package com.quizapp.user_auth_service.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailEvent {
	@JsonProperty("id")
	@Builder.Default
	private String id = UUID.randomUUID().toString();
	
	@JsonProperty("event_type")
	private String type; // password_reset, welcome, etc.
	
	@JsonProperty("user_id")
	private Long userId;
	
	@JsonProperty("timestamp")
	@Builder.Default
	private String timestamp = DateTimeFormatter.ISO_INSTANT.format(Instant.now());
	
	@JsonProperty("data")
	@Builder.Default
	private Map<String, Object> data = new HashMap<>();
	
	@JsonProperty("retry")
	@Builder.Default
	private int retry = 0;
	
	// Helper fields - sẽ được đưa vào data map
	private String email;
	private String subject;
	private String token;
	private String frontendUrl;
	private String userName;
	
	// Helper method to populate data map
	public void populateDataMap() {
		if (this.data == null) {
			this.data = new HashMap<>();
		}
		if (this.email != null) this.data.put("recipient_email", this.email);
		if (this.subject != null) this.data.put("subject", this.subject);
		if (this.token != null) this.data.put("reset_token", this.token);
		if (this.frontendUrl != null) this.data.put("reset_url", this.frontendUrl);
		if (this.userName != null) this.data.put("user_name", this.userName);
	}
	
	// Static factory method để tạo event với auto-populated data
	public static EmailEvent create(String type, Long userId, String email, String subject, 
									String token, String frontendUrl, String userName) {
		EmailEvent event = EmailEvent.builder()
			.type(type)
			.userId(userId)
			.build();
		event.email = email;
		event.subject = subject;
		event.token = token;
		event.frontendUrl = frontendUrl;
		event.userName = userName;
		event.populateDataMap();
		return event;
	}
}


