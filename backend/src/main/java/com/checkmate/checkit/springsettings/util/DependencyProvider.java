package com.checkmate.checkit.springsettings.util;

import java.util.Arrays;
import java.util.List;

/**
 * 프로젝트에서 사용할 수 있는 모든 Spring Boot 의존성 목록을 제공하는 유틸리티 클래스
 */
public class DependencyProvider {

	private static final List<String> ALL_DEPENDENCIES = Arrays.asList(
		// 개발자 도구
		"GraalVM Native Support", "GraphQL DGS Code Generation", "Spring Boot DevTools",
		"Lombok", "Spring Configuration Processor", "Docker Compose Support", "Spring Modulith",
		// 웹
		"Spring Web", "Spring Reactive Web", "Spring for GraphQL", "Rest Repositories",
		"Spring Session", "Rest Repositories HAL Explorer", "Spring HATEOAS", "Spring Web Services",
		"Jersey", "Vaadin", "Netflix DGS", "htnx",
		// 템플릿 엔진
		"Thymeleaf", "Apache Freemarker", "Mustache", "Groovy Templates", "JTE",
		// 보안
		"Spring Security", "OAuth2 Client", "OAuth2 Authorization Server", "OAuth2 Resource Server",
		"Spring LDAP", "Okta",
		// SQL
		"JDBC API", "Spring Data JPA", "Spring Data JDBC", "Spring Data R2DBC",
		"MyBatis Framework", "Liquibase Migration", "Flyway Migration", "JOOQ Access Layer",
		"IBM DB2 Driver", "Apache Derby Database", "H2 Database", "HyperSQL Database",
		"MariaDB Driver", "MS SQL Server Driver", "MySQL Driver", "Oracle Driver", "PostgreSQL Driver",
		// NoSQL
		"Spring Data Redis (Access+Driver)", "Spring Data Reactive Redis", "Spring Data MongoDB",
		"Spring Data Reactive MongoDB", "Spring Data Elasticsearch (Access+Driver)",
		"Spring Data for Apache Cassandra", "Spring Data Reactive for Apache Cassandra",
		"Spring Data Couchbase", "Spring Data Reactive Couchbase", "Spring Data Neo4j",
		// 메시징
		"Spring Integration", "Spring for RabbitMQ", "Spring for RabbitMQ Streams",
		"Spring for Apache Kafka", "Spring for Apache Kafka Streams",
		"Spring for Apache ActiveMQ 5", "Spring for Apache ActiveMQ Artemis",
		"Spring for Apache Pulsar", "Spring for Apache Pulsar (Reactive)", "WebSocket",
		"RSocket", "Apache Camel", "Solace PubSub+",
		// I/O
		"Spring Batch", "Validation", "Java Mail Sender", "Quartz Scheduler",
		"Spring Cache Abstraction", "Spring Shell", "Spring gRPC",
		// OPS
		"Spring Boot Actuator", "CycloneDX SBOM support",
		"codecentric's Spring Boot Admin (Client)", "codecentric's Spring Boot Admin (Server)", "Sentry",
		// Observability
		"Datadog", "Dynatrace", "Influx", "Graphite", "New Relic", "OTLP for metrics",
		"Prometheus", "Distributed Tracing", "Wavefront", "Zipkin",
		// Testing
		"Spring REST Docs", "Testcontainers", "Contract Verifier", "Contract Stub Runner", "Embedded LDAP Server",
		// Spring Cloud
		"Cloud Bootstrap", "Function", "Task",
		// Spring Cloud Config
		"Config Client", "Config Server", "Vault Configuration", "Apache Zookeeper Configuration",
		"Consul Configuration",
		// Spring Cloud Discovery
		"Eureka Discovery Client", "Eureka Server", "Apache Zookeeper Discovery", "Consul Discovery",
		// Spring Cloud Routing
		"Gateway", "Reactive Gateway", "OpenFeign", "Cloud LoadBalancer",
		// Spring Cloud Circuit Breaker
		"Resilience4J",
		// Spring Cloud Messaging
		"Cloud Bus", "Cloud Stream",
		// Tanzu for Spring Boot
		"Config Client (TAS)", "Service Registry (TAS)",
		// Tanzu Spring Enterprise Extensions
		"Governance Starter (Enterprise)", "Spring Cloud Gateway Access Control (Enterprise)",
		"Spring Cloud Gateway Custom (Enterprise)", "Spring Cloud Gateway GraphQL (Enterprise)",
		"Spring Cloud Gateway Single Sign On (Enterprise)", "Spring Cloud Gateway Traffic Control (Enterprise)",
		"Spring Cloud Gateway Transformation (Enterprise)",
		// Azure
		"Azure Support", "Azure Active Directory", "Azure Cosmos DB", "Azure Key Vault",
		"Azure Storage", "Azure OpenAI", "Azure AI Search",
		// Google Cloud
		"Google Cloud Support", "Google Cloud Messaging", "Google Cloud Storage",
		// AI
		"Anthropic Claude", "Amazon Bedrock", "Amazon Bedrock Converse", "Apache Cassandra Vector Database",
		"Chroma Vector Database", "Elasticsearch Vector Database", "Model Context Protocol Server",
		"Model Context Protocol Client", "Milvus Vector Database", "Mistral AI",
		"MongoDB Atlas Vector Database", "Neo4j Vector Database", "Ollama", "OpenAI",
		"Oracle Vector Database", "PGvector Vector Database", "Pinecone Vector Database",
		"PostgresML", "Redis Search and Query Vector Database", "MariaDB Vector Database",
		"Azure Cosmos DB Vector Store", "Stability AI", "Transformer (ONNX) Embeddings",
		"Vertex AI Gemini", "Vertex AI Embeddings", "Qdrant Vector Database",
		"Typesense Vector Database", "Weaviate Vector Database", "Markdown Document Reader",
		"Tika Document Reader", "PDF Document Reader", "Timefold Solver"
	);

	/**
	 * 전체 의존성 목록 반환
	 */
	public static List<String> getAllDependencies() {
		return ALL_DEPENDENCIES;
	}
}
