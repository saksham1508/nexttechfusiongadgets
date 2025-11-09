# AWS CloudFront CDN Configuration for NextTechFusionGadgets

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# S3 Bucket for Static Assets
resource "aws_s3_bucket" "static_assets" {
  bucket = "nexttechfusion-static-assets-${var.environment}"

  tags = {
    Name        = "NextTechFusion Static Assets"
    Environment = var.environment
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for NextTechFusion static assets"
}

# S3 Bucket Policy for CloudFront Access
resource "aws_s3_bucket_policy" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_assets.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "NextTechFusion CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # Use only US, Canada, Europe

  # Origin for Static Assets (S3)
  origin {
    domain_name = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id   = "S3-nexttechfusion-static"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Origin for API (ALB)
  origin {
    domain_name = var.alb_domain_name
    origin_id   = "ALB-nexttechfusion-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default Cache Behavior (Static Assets)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-nexttechfusion-static"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400  # 24 hours
    max_ttl                = 31536000  # 1 year

    # Compress objects automatically
    compress = true

    # Cache based on Accept-Encoding
    cache_policy_id = aws_cloudfront_cache_policy.static_assets.id
  }

  # API Cache Behavior
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-nexttechfusion-api"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0  # No caching for API by default
    max_ttl                = 0

    # API-specific cache policy
    cache_policy_id = aws_cloudfront_cache_policy.api.id
  }

  # Custom Error Pages
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 300
  }

  # SSL/TLS Configuration
  viewer_certificate {
    acm_certificate_arn      = var.ssl_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Geo Restrictions (optional)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # WAF Integration (optional)
  web_acl_id = var.waf_acl_id

  tags = {
    Name        = "NextTechFusion CDN"
    Environment = var.environment
  }
}

# Cache Policies

# Static Assets Cache Policy
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "nexttechfusion-static-cache-policy"
  comment     = "Cache policy for static assets"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# API Cache Policy
resource "aws_cloudfront_cache_policy" "api" {
  name        = "nexttechfusion-api-cache-policy"
  comment     = "Cache policy for API endpoints"
  default_ttl = 0
  max_ttl     = 3600
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization", "Content-Type", "Accept"]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

# Origin Request Policies

# Static Assets Origin Request Policy
resource "aws_cloudfront_origin_request_policy" "static_assets" {
  name    = "nexttechfusion-static-origin-policy"
  comment = "Origin request policy for static assets"

  cookies_config {
    cookie_behavior = "none"
  }
  headers_config {
    header_behavior = "none"
  }
  query_strings_config {
    query_string_behavior = "none"
  }
}

# API Origin Request Policy
resource "aws_cloudfront_origin_request_policy" "api" {
  name    = "nexttechfusion-api-origin-policy"
  comment = "Origin request policy for API"

  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["Authorization", "Content-Type", "Accept", "Origin"]
    }
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}

# CloudFront Functions for Edge Computing

# Request Function (URL Rewrites, etc.)
resource "aws_cloudfront_function" "request_function" {
  name    = "nexttechfusion-request-function"
  comment = "Request processing function"
  runtime = "cloudfront-js-1.0"
  code    = <<-EOF
    function handler(event) {
        var request = event.request;
        var uri = request.uri;

        // SPA routing - redirect to index.html for non-API routes
        if (!uri.startsWith('/api/') && !uri.includes('.')) {
            request.uri = '/index.html';
        }

        // Security headers
        request.headers['x-forwarded-proto'] = { value: request.headers['x-forwarded-proto'] || 'https' };

        return request;
    }
  EOF
}

# Response Function (Security Headers, etc.)
resource "aws_cloudfront_function" "response_function" {
  name    = "nexttechfusion-response-function"
  comment = "Response processing function"
  runtime = "cloudfront-js-1.0"
  code    = <<-EOF
    function handler(event) {
        var response = event.response;
        var headers = response.headers;

        // Security headers
        headers['strict-transport-security'] = { value: 'max-age=31536000; includeSubDomains; preload' };
        headers['x-content-type-options'] = { value: 'nosniff' };
        headers['x-frame-options'] = { value: 'DENY' };
        headers['x-xss-protection'] = { value: '1; mode=block' };
        headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };

        // CORS headers for API
        if (event.request.uri.startsWith('/api/')) {
            headers['access-control-allow-origin'] = { value: '*' };
            headers['access-control-allow-methods'] = { value: 'GET, POST, PUT, DELETE, OPTIONS' };
            headers['access-control-allow-headers'] = { value: 'Content-Type, Authorization' };
        }

        return response;
    }
  EOF
}

# Attach Functions to Distribution
resource "aws_cloudfront_distribution" "cdn_with_functions" {
  # ... existing configuration ...

  default_cache_behavior {
    # ... existing configuration ...
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.request_function.arn
    }
    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.response_function.arn
    }
  }
}

# Monitoring and Logging

# CloudFront Real-time Logs
resource "aws_cloudfront_realtime_log_config" "realtime_logs" {
  name          = "nexttechfusion-realtime-logs"
  sampling_rate = 100

  fields = [
    "timestamp",
    "c-ip",
    "sc-status",
    "cs-uri-stem",
    "cs-uri-query",
    "cs-method",
    "cs-host",
    "cs-user-agent",
    "cs-referer",
    "cs-cookie",
    "x-edge-location",
    "x-edge-request-id",
    "x-host-header"
  ]

  endpoint {
    stream_type = "Kinesis"

    kinesis_stream_config {
      role_arn   = aws_iam_role.cloudfront_logs.arn
      stream_arn = aws_kinesis_stream.logs.arn
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "alb_domain_name" {
  description = "ALB domain name for API origin"
  type        = string
}

variable "ssl_certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
}

variable "waf_acl_id" {
  description = "WAF ACL ID for additional security (optional)"
  type        = string
  default     = null
}

# Outputs
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = aws_s3_bucket.static_assets.bucket
}