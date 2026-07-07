<?php

use App\Http\Controllers\Api\V1\Admin\CatalogAdminController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\DisputeAdminController;
use App\Http\Controllers\Api\V1\Admin\GeoAdminController;
use App\Http\Controllers\Api\V1\Admin\ModerationAdminController;
use App\Http\Controllers\Api\V1\Admin\MonetizationAdminController;
use App\Http\Controllers\Api\V1\Admin\OrderAdminController;
use App\Http\Controllers\Api\V1\Admin\PlatformAdminController;
use App\Http\Controllers\Api\V1\Admin\SupportAdminController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\Admin\VerificationAdminController;
use App\Http\Controllers\Api\V1\Admin\WithdrawalAdminController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\OtpController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\ClientProfileController;
use App\Http\Controllers\Api\V1\ConnectController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\DisputeController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\FreelancerDirectoryController;
use App\Http\Controllers\Api\V1\FreelancerProfileController;
use App\Http\Controllers\Api\V1\InternshipController;
use App\Http\Controllers\Api\V1\JobPostController;
use App\Http\Controllers\Api\V1\MetaController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PaymentWebhookController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ProposalController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SubscriptionPlanController;
use App\Http\Controllers\Api\V1\SupportTicketController;
use App\Http\Controllers\Api\V1\VerificationController;
use App\Http\Controllers\Api\V1\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    /*
    |----------------------------------------------------------------------
    | Public routes
    |----------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('otp/send', [OtpController::class, 'send'])->middleware('throttle:5,1');
        Route::post('otp/verify', [OtpController::class, 'verify'])->middleware('throttle:10,1');
        Route::post('password/reset', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');
    });

    Route::prefix('meta')->group(function () {
        Route::get('countries', [MetaController::class, 'countries']);
        Route::get('cities', [MetaController::class, 'cities']);
        Route::get('categories', [MetaController::class, 'categories']);
        Route::get('skills', [MetaController::class, 'skills']);
        Route::get('settings', [MetaController::class, 'settings']);
    });

    Route::get('jobs', [JobPostController::class, 'index']);
    Route::get('jobs/{job}', [JobPostController::class, 'show']);
    Route::get('services', [ServiceController::class, 'index']);
    Route::get('services/{service}', [ServiceController::class, 'show']);
    Route::get('freelancers', [FreelancerDirectoryController::class, 'index']);
    Route::get('freelancers/{user}', [FreelancerDirectoryController::class, 'show']);
    Route::get('freelancers/{user}/reviews', [FreelancerDirectoryController::class, 'reviews']);
    Route::get('internships', [InternshipController::class, 'index']);
    Route::get('internships/{internship}', [InternshipController::class, 'show']);
    Route::get('connect-packs', [ConnectController::class, 'packs']);
    Route::get('subscription-plans', [SubscriptionPlanController::class, 'index']);

    Route::post('webhooks/payments', [PaymentWebhookController::class, 'handle'])->middleware('throttle:60,1');

    /*
    |----------------------------------------------------------------------
    | Authenticated routes (any active account)
    |----------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });

        Route::prefix('me')->group(function () {
            Route::patch('/', [ProfileController::class, 'update']);
            Route::post('avatar', [ProfileController::class, 'uploadAvatar']);
            Route::patch('password', [ProfileController::class, 'changePassword']);
            Route::post('switch-role', [ProfileController::class, 'switchRole']);

            Route::get('client-profile', [ClientProfileController::class, 'show']);
            Route::patch('client-profile', [ClientProfileController::class, 'update']);

            Route::get('freelancer-profile', [FreelancerProfileController::class, 'show']);
            Route::patch('freelancer-profile', [FreelancerProfileController::class, 'update']);
            Route::put('freelancer-profile/skills', [FreelancerProfileController::class, 'syncSkills']);
            Route::get('portfolio', [FreelancerProfileController::class, 'portfolio']);
            Route::post('portfolio', [FreelancerProfileController::class, 'storePortfolioItem']);
            Route::delete('portfolio/{portfolioItem}', [FreelancerProfileController::class, 'destroyPortfolioItem']);

            Route::get('jobs', [JobPostController::class, 'myJobs']);
            Route::get('proposals', [ProposalController::class, 'mine']);
            Route::get('services', [ServiceController::class, 'mine']);
            Route::get('disputes', [DisputeController::class, 'index']);
            Route::get('internship-applications', [InternshipController::class, 'myApplications']);

            Route::get('verification-requests', [VerificationController::class, 'index']);
            Route::post('verification-requests', [VerificationController::class, 'store']);
        });

        // Jobs (write side)
        Route::post('jobs', [JobPostController::class, 'store']);
        Route::patch('jobs/{job}', [JobPostController::class, 'update']);
        Route::post('jobs/{job}/publish', [JobPostController::class, 'publish']);
        Route::post('jobs/{job}/close', [JobPostController::class, 'close']);
        Route::post('jobs/{job}/cancel', [JobPostController::class, 'cancel']);

        // Proposals
        Route::post('jobs/{job}/proposals', [ProposalController::class, 'store']);
        Route::get('jobs/{job}/proposals', [ProposalController::class, 'forJob']);
        Route::patch('proposals/{proposal}', [ProposalController::class, 'update']);
        Route::post('proposals/{proposal}/withdraw', [ProposalController::class, 'withdraw']);
        Route::post('proposals/{proposal}/shortlist', [ProposalController::class, 'shortlist']);
        Route::post('proposals/{proposal}/decline', [ProposalController::class, 'decline']);
        Route::post('proposals/{proposal}/accept', [ProposalController::class, 'accept']);

        // Services (write side)
        Route::post('services', [ServiceController::class, 'store']);
        Route::patch('services/{service}', [ServiceController::class, 'update']);
        Route::post('services/{service}/status', [ServiceController::class, 'setStatus']);
        Route::post('services/{service}/images', [ServiceController::class, 'uploadImages']);
        Route::post('services/{service}/order', [ServiceController::class, 'order']);

        // Favorites
        Route::get('favorites', [FavoriteController::class, 'index']);
        Route::post('favorites', [FavoriteController::class, 'store']);
        Route::delete('favorites', [FavoriteController::class, 'destroy']);

        // Messaging
        Route::get('conversations', [ConversationController::class, 'index']);
        Route::post('conversations', [ConversationController::class, 'store']);
        Route::get('conversations/{conversation}/messages', [ConversationController::class, 'messages']);
        Route::post('conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
        Route::post('conversations/{conversation}/read', [ConversationController::class, 'markRead']);

        // Orders & contracts
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::get('orders/{order}/events', [OrderController::class, 'events']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);

        // Deliveries
        Route::post('orders/{order}/deliveries', [DeliveryController::class, 'store']);
        Route::post('deliveries/{delivery}/approve', [DeliveryController::class, 'approve']);
        Route::post('deliveries/{delivery}/request-revision', [DeliveryController::class, 'requestRevision']);

        // Payments & escrow
        Route::post('orders/{order}/pay', [PaymentController::class, 'payOrder']);
        Route::post('milestones/{milestone}/pay', [PaymentController::class, 'payMilestone']);
        Route::get('payments', [PaymentController::class, 'index']);
        Route::get('payments/{reference}', [PaymentController::class, 'show']);
        Route::post('payments/{reference}/confirm-sandbox', [PaymentController::class, 'confirmSandbox']);

        // Wallet & withdrawals
        Route::get('wallet', [WalletController::class, 'show']);
        Route::get('wallet/transactions', [WalletController::class, 'transactions']);
        Route::post('withdrawals', [WalletController::class, 'requestWithdrawal']);
        Route::get('withdrawals', [WalletController::class, 'withdrawals']);

        // Connects
        Route::post('connect-packs/{connectPack}/purchase', [ConnectController::class, 'purchase']);
        Route::get('connects/history', [ConnectController::class, 'history']);

        // Reviews
        Route::post('orders/{order}/reviews', [ReviewController::class, 'store']);
        Route::get('orders/{order}/reviews', [ReviewController::class, 'forOrder']);

        // Disputes
        Route::post('orders/{order}/disputes', [DisputeController::class, 'store']);
        Route::get('disputes/{dispute}', [DisputeController::class, 'show']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

        // Internships
        Route::post('internships/{internship}/apply', [InternshipController::class, 'apply']);

        // Support
        Route::get('support/tickets', [SupportTicketController::class, 'index']);
        Route::post('support/tickets', [SupportTicketController::class, 'store']);
        Route::get('support/tickets/{ticket}', [SupportTicketController::class, 'show']);
        Route::post('support/tickets/{ticket}/messages', [SupportTicketController::class, 'reply']);
    });

    /*
    |----------------------------------------------------------------------
    | Admin routes
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware(['auth:sanctum', 'account.active', 'role:admin'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index']);

        Route::get('users', [UserAdminController::class, 'index']);
        Route::get('users/{user}', [UserAdminController::class, 'show']);
        Route::post('users/{user}/suspend', [UserAdminController::class, 'suspend']);
        Route::post('users/{user}/activate', [UserAdminController::class, 'activate']);
        Route::patch('users/{user}/role', [UserAdminController::class, 'updateRole']);

        Route::get('verification-requests', [VerificationAdminController::class, 'index']);
        Route::post('verification-requests/{verificationRequest}/approve', [VerificationAdminController::class, 'approve']);
        Route::post('verification-requests/{verificationRequest}/reject', [VerificationAdminController::class, 'reject']);

        Route::get('jobs', [ModerationAdminController::class, 'jobs']);
        Route::patch('jobs/{job}', [ModerationAdminController::class, 'updateJob']);
        Route::get('services', [ModerationAdminController::class, 'services']);
        Route::patch('services/{service}', [ModerationAdminController::class, 'updateService']);
        Route::get('reviews', [ModerationAdminController::class, 'reviews']);
        Route::patch('reviews/{review}', [ModerationAdminController::class, 'updateReview']);

        Route::get('orders', [OrderAdminController::class, 'index']);
        Route::get('orders/{order}', [OrderAdminController::class, 'show']);
        Route::patch('orders/{order}/status', [OrderAdminController::class, 'updateStatus']);
        Route::get('payments', [OrderAdminController::class, 'payments']);

        Route::get('withdrawals', [WithdrawalAdminController::class, 'index']);
        Route::post('withdrawals/{withdrawal}/approve', [WithdrawalAdminController::class, 'approve']);
        Route::post('withdrawals/{withdrawal}/mark-paid', [WithdrawalAdminController::class, 'markPaid']);
        Route::post('withdrawals/{withdrawal}/reject', [WithdrawalAdminController::class, 'reject']);

        Route::get('disputes', [DisputeAdminController::class, 'index']);
        Route::get('disputes/{dispute}', [DisputeAdminController::class, 'show']);
        Route::get('disputes/{dispute}/conversation', [DisputeAdminController::class, 'conversation']);
        Route::post('disputes/{dispute}/under-review', [DisputeAdminController::class, 'underReview']);
        Route::post('disputes/{dispute}/resolve', [DisputeAdminController::class, 'resolve']);

        Route::get('categories', [CatalogAdminController::class, 'categories']);
        Route::post('categories', [CatalogAdminController::class, 'storeCategory']);
        Route::patch('categories/{category}', [CatalogAdminController::class, 'updateCategory']);
        Route::get('skills', [CatalogAdminController::class, 'skills']);
        Route::post('skills', [CatalogAdminController::class, 'storeSkill']);
        Route::patch('skills/{skill}', [CatalogAdminController::class, 'updateSkill']);

        Route::get('countries', [GeoAdminController::class, 'countries']);
        Route::post('countries', [GeoAdminController::class, 'storeCountry']);
        Route::patch('countries/{country}', [GeoAdminController::class, 'updateCountry']);
        Route::post('cities', [GeoAdminController::class, 'storeCity']);
        Route::patch('cities/{city}', [GeoAdminController::class, 'updateCity']);

        Route::get('connect-packs', [MonetizationAdminController::class, 'connectPacks']);
        Route::post('connect-packs', [MonetizationAdminController::class, 'storeConnectPack']);
        Route::patch('connect-packs/{connectPack}', [MonetizationAdminController::class, 'updateConnectPack']);
        Route::get('subscription-plans', [MonetizationAdminController::class, 'plans']);
        Route::post('subscription-plans', [MonetizationAdminController::class, 'storePlan']);
        Route::patch('subscription-plans/{subscriptionPlan}', [MonetizationAdminController::class, 'updatePlan']);
        Route::get('coupons', [MonetizationAdminController::class, 'coupons']);
        Route::post('coupons', [MonetizationAdminController::class, 'storeCoupon']);
        Route::patch('coupons/{coupon}', [MonetizationAdminController::class, 'updateCoupon']);

        Route::get('settings', [PlatformAdminController::class, 'settings']);
        Route::put('settings', [PlatformAdminController::class, 'updateSettings']);
        Route::get('broadcasts', [PlatformAdminController::class, 'broadcasts']);
        Route::post('broadcasts', [PlatformAdminController::class, 'broadcast']);
        Route::get('audit-logs', [PlatformAdminController::class, 'auditLogs']);
        Route::get('reports/revenue', [PlatformAdminController::class, 'revenueReport']);

        Route::get('support/tickets', [SupportAdminController::class, 'tickets']);
        Route::get('support/tickets/{ticket}', [SupportAdminController::class, 'ticket']);
        Route::post('support/tickets/{ticket}/messages', [SupportAdminController::class, 'reply']);
        Route::patch('support/tickets/{ticket}/status', [SupportAdminController::class, 'updateTicketStatus']);

        Route::post('internships', [SupportAdminController::class, 'storeInternship']);
        Route::patch('internships/{internship}', [SupportAdminController::class, 'updateInternship']);
    });
});
