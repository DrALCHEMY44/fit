import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:freelance_interconnect/app/app.dart';
import 'package:freelance_interconnect/core/api/api_client.dart';
import 'package:freelance_interconnect/core/api/session.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    Session.user.value = null;
  });

  testWidgets('boots to the splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const FITApp());

    // Branding renders while the stored session is being restored.
    expect(find.text('Freelance Interconnect'), findsOneWidget);

    // Let the splash timers (session restore + 3s delay) run out.
    await tester.pumpAndSettle(const Duration(seconds: 4));
  });

  test('FitUser parses an API payload', () {
    final user = FitUser.fromJson({
      'id': 1,
      'name': 'Diane Ngono',
      'role': 'freelancer',
      'connects_balance': 24,
      'freelancer_profile': {
        'title': 'Senior React Developer',
        'availability': 'available',
        'job_success_score': 97,
        'rating': '4.97',
        'skills': [
          {'name': 'React'},
          {'name': 'TypeScript'},
        ],
      },
    });

    expect(user.initials, 'DN');
    expect(user.isFreelancer, isTrue);
    expect(user.connectsBalance, 24);
    expect(user.jss, 97);
    expect(user.skills, ['React', 'TypeScript']);
  });

  test('uses the production FIT API by default', () {
    expect(ApiClient.productionBaseUrl, 'https://api.fit.fobs.dev/api/v1');
    expect(ApiClient.instance.baseUrl, ApiClient.productionBaseUrl);
  });
}
