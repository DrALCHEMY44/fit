import 'dart:convert';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Error raised for non-2xx API responses, carrying Laravel validation errors.
class ApiException implements Exception {
  ApiException(this.status, this.message, [this.errors = const {}]);

  final int status;
  final String message;
  final Map<String, dynamic> errors;

  /// First validation message, falling back to the top-level message.
  String get firstError {
    if (errors.isNotEmpty) {
      final first = errors.values.first;
      if (first is List && first.isNotEmpty) return first.first.toString();
    }
    return message;
  }

  @override
  String toString() => 'ApiException($status): $message';
}

/// Thin HTTP client for the FIT Laravel API.
///
/// Base URL priority: `--dart-define=FIT_API_URL=...`, then a platform
/// default (Android emulators reach the host machine via 10.0.2.2).
class ApiClient {
  ApiClient._();

  static final ApiClient instance = ApiClient._();

  static const _tokenKey = 'fit_token';

  static const String _definedUrl = String.fromEnvironment('FIT_API_URL');

  String get baseUrl {
    if (_definedUrl.isNotEmpty) return _definedUrl;
    if (!kIsWeb && Platform.isAndroid) return 'https://api.fit.fobs.dev/api/v1';
    return 'https://api.fit.fobs.dev/api/v1';
  }

  String? _token;

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
  }

  bool get hasToken => _token != null && _token!.isNotEmpty;

  Future<void> saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) =>
      _send('GET', path, query: query);

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) =>
      _send('POST', path, body: body);

  Future<dynamic> patch(String path, {Map<String, dynamic>? body}) =>
      _send('PATCH', path, body: body);

  Future<dynamic> put(String path, {Map<String, dynamic>? body}) =>
      _send('PUT', path, body: body);

  Future<dynamic> delete(String path, {Map<String, dynamic>? body}) =>
      _send('DELETE', path, body: body);

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, dynamic>? body,
  }) async {
    var uri = Uri.parse('$baseUrl$path');
    if (query != null && query.isNotEmpty) {
      uri = uri.replace(queryParameters: {...uri.queryParameters, ...query});
    }

    final headers = <String, String>{
      'Accept': 'application/json',
      if (body != null) 'Content-Type': 'application/json',
      if (hasToken) 'Authorization': 'Bearer $_token',
    };

    http.Response response;
    try {
      final request = http.Request(method, uri)..headers.addAll(headers);
      if (body != null) request.body = jsonEncode(body);
      response =
          await http.Response.fromStream(await request.send().timeout(const Duration(seconds: 20)));
    } catch (_) {
      throw ApiException(0, 'Network error — check your connection and the FIT API URL.');
    }

    dynamic payload;
    if (response.body.isNotEmpty) {
      try {
        payload = jsonDecode(response.body);
      } catch (_) {
        payload = null;
      }
    }

    if (response.statusCode >= 400) {
      if (response.statusCode == 401) await clearToken();
      final message = payload is Map<String, dynamic>
          ? (payload['message']?.toString() ?? 'Request failed (${response.statusCode})')
          : 'Request failed (${response.statusCode})';
      final errors = payload is Map<String, dynamic> && payload['errors'] is Map<String, dynamic>
          ? payload['errors'] as Map<String, dynamic>
          : <String, dynamic>{};
      throw ApiException(response.statusCode, message, errors);
    }

    return payload;
  }
}

/// Endpoints return either `{"data": {...}}` or a bare object — normalize.
Map<String, dynamic> unwrap(dynamic payload) {
  if (payload is Map<String, dynamic>) {
    final data = payload['data'];
    if (data is Map<String, dynamic>) return data;
    return payload;
  }
  return <String, dynamic>{};
}

/// Extracts the list from a paginated or plain `{"data": [...]}` response.
List<Map<String, dynamic>> unwrapList(dynamic payload) {
  final data = payload is Map<String, dynamic> ? payload['data'] : payload;
  if (data is List) return data.whereType<Map<String, dynamic>>().toList();
  return const [];
}
