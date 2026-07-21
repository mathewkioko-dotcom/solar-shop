<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - Baraka Solar Shop</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/shop.css') }}">
    <style>
        .checkout-shell { background: #06030d; min-height: 100vh; color: #f8f4ff; padding: 1.5rem; }
        .checkout-header { display: grid; gap: 1rem; margin-bottom: 1.5rem; }
        .checkout-title { font-size: clamp(2.1rem, 3vw, 3rem); margin: 0; }
        .checkout-grid { display: grid; gap: 1.5rem; max-width: 1180px; margin: 0 auto; grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr); }
        .checkout-card, .summary-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 1.75rem; }
        .section-title { margin-top: 0; margin-bottom: 1rem; font-size: 1.25rem; letter-spacing: 0.02em; }
        .field-group { display: grid; gap: 0.75rem; margin-bottom: 1rem; }
        .field-group label { display: block; color: #c9c0c8; font-size: 0.95rem; font-weight: 600; }
        .field-group input, .field-group select { width: 100%; border-radius: 16px; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.05); padding: 0.95rem 1rem; color: #f8f4ff; }
        .field-group input::placeholder { color: rgba(248,244,255,0.5); }
        .btn-pay { width: 100%; margin-top: 0.5rem; }
        .trust-pill { display: inline-flex; gap: 0.5rem; align-items: center; padding: 0.65rem 0.9rem; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #e4e0ff; font-size: 0.9rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }
        .order-item { display: grid; grid-template-columns: 72px 1fr auto; gap: 0.9rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .order-item:last-child { border-bottom: none; }
        .order-item img { width: 72px; height: 72px; object-fit: cover; border-radius: 18px; }
        .order-item-meta strong { display: block; margin-bottom: 0.35rem; }
        .order-item-meta span { display: block; color: #a7a3b0; font-size: 0.93rem; }
        .summary-total { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 1.05rem; }
        .summary-total strong { font-size: 1.15rem; }
        .notice-box { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1rem; }
        .overlay-shell { position: fixed; inset: 0; z-index: 1000; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); padding: 1rem; }
        .overlay-shell.active { display: flex; }
        .overlay-panel { width: min(560px, 100%); background: #09070f; border: 1px solid rgba(255,255,255,0.14); border-radius: 28px; padding: 2rem; text-align: center; box-shadow: 0 32px 80px rgba(0,0,0,0.35); }
        .overlay-panel h2 { margin: 0 0 0.75rem; font-size: clamp(1.5rem, 2vw, 2.3rem); }
        .overlay-panel p { color: #c9c0c8; margin: 0.35rem 0 1.5rem; line-height: 1.75; }
        .countdown-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 120px; border-radius: 999px; padding: 0.75rem 1rem; background: #12111a; color: #f8f4ff; font-weight: 700; letter-spacing: 0.02em; margin: 0 auto 1rem; }
        .small-note { color: #9b95a5; font-size: 0.95rem; line-height: 1.6; }
        .muted-link { color: #ae9cff; text-decoration: none; }
        @media(max-width: 920px) { .checkout-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="checkout-shell">
        <div class="checkout-header">
            <div>
                <p style="color:#8e84a9; text-transform: uppercase; letter-spacing: 0.25em; font-size:0.82rem; margin-bottom:0.75rem;">Secure checkout</p>
                <h1 class="checkout-title">Complete payment with M-Pesa</h1>
                <p class="small-note">A fast STK Push is sent straight to your phone. If your payment cannot be completed instantly, use the fallback manual instructions below.</p>
            </div>
            <a href="{{ route('shop.index') }}" class="btn btn-secondary" style="align-self:start;">Continue shopping</a>
        </div>

        <div class="checkout-grid">
            <section class="checkout-card">
                <div class="notice-box">
                    <strong>Hold inventory while the payment completes</strong>
                    <p class="small-note">We reserve your cart for up to 15 minutes once the STK Push is sent. Do not refresh the page until your payment confirms.</p>
                </div>

                <h2 class="section-title">1. Customer details</h2>
                @if(!empty($customerUser))
                    <div class="notice-box" style="background: rgba(14,51,99,0.14); border-color: rgba(56,103,228,0.24);">
                        <strong>{{ $customerUser['name'] }}</strong>
                        <p class="small-note" style="margin:0.5rem 0 0;">{{ $customerUser['email'] ?? 'No email provided' }} · {{ $customerUser['phone'] ?? 'No phone provided' }}</p>
                    </div>
                @else
                    <div class="notice-box">
                        <p style="margin:0;">You are checking out as a guest. For order tracking, please register or login, but you may still complete payment now.</p>
                        <a href="{{ route('shop.index') }}" class="btn btn-secondary" style="margin-top:1rem; display:inline-flex;">Open shop</a>
                    </div>
                @endif

                <form id="checkout-form" class="field-group">
                    <div class="field-group">
                        <label for="phone-number">Mobile number</label>
                        <input id="phone-number" name="phone" type="tel" inputmode="tel" pattern="^2547[0-9]{8}$" placeholder="2547XXXXXXXX" value="{{ $customerUser['phone'] ?? '' }}" autocomplete="tel" required>
                    </div>

                    <div class="field-group">
                        <label>Payment option</label>
                        <select name="payment_method" id="payment-method" class="auth-input">
                            <option value="mpesa">M-Pesa STK Push</option>
                            <option value="manual">Manual M-Pesa instructions</option>
                        </select>
                    </div>

                    <div class="field-group">
                        <label>Order total</label>
                        <input type="text" readonly value="Ksh {{ number_format($cartTotal, 2) }}" class="auth-input" aria-label="Order total">
                    </div>

                    <button type="submit" id="pay-now-button" class="btn btn-primary btn-pay" {{ empty($cart) ? 'disabled' : '' }}>Pay via M-Pesa</button>
                </form>

                <div id="checkout-notice" class="notice-box" style="margin-top:1.5rem; display:none;"></div>

                <div class="notice-box" style="margin-top:1.5rem;">
                    <strong>Manual fallback</strong>
                    <p class="small-note">If the STK prompt is not received, you can still pay using Paybill <strong>{{ config('mpesa.shortcode') }}</strong> and account reference <strong>9906877</strong>. After payment, send your MPESA receipt to our support team for instant confirmation.</p>
                </div>
            </section>

            <aside class="summary-card">
                <h2 class="section-title">Order summary</h2>
                @if(empty($cart) || count($cart) === 0)
                    <p>Your cart is empty. Add products to continue.</p>
                @else
                    @foreach($cart as $item)
                        <div class="order-item">
                            <img src="{{ asset($item['image_path'] ?? 'images/placeholder.png') }}" alt="{{ $item['name'] }}">
                            <div class="order-item-meta">
                                <strong>{{ $item['name'] }}</strong>
                                <span>{{ $item['quantity'] }} × Ksh {{ number_format($item['price'], 2) }}</span>
                            </div>
                            <div style="font-weight:700;">Ksh {{ number_format($item['price'] * $item['quantity'], 2) }}</div>
                        </div>
                    @endforeach
                @endif

                <div class="summary-total">
                    <span>Total</span>
                    <strong>Ksh {{ number_format($cartTotal, 2) }}</strong>
                </div>

                <div style="margin-top:1.75rem;">
                    <div class="trust-pill">Safe checkout</div>
                    <div class="trust-pill">24/7 support</div>
                    <div class="trust-pill">Instant M-Pesa</div>
                </div>
            </aside>
        </div>
    </div>

    <div id="payment-overlay" class="overlay-shell" role="alertdialog" aria-modal="true">
        <div class="overlay-panel">
            <h2 id="overlay-title">Preparing your payment</h2>
            <p id="overlay-message">We are sending the STK Push to your phone. Keep the page open while it completes.</p>
            <div class="countdown-pill"><span id="overlay-countdown">00:00</span> remaining</div>
            <p class="small-note">If the request does not arrive, check the number or try again with manual payment instructions.</p>
            <button id="overlay-close" class="btn btn-secondary" style="display:none; margin-top:1rem;">Close</button>
        </div>
    </div>

    <script>
        const mpesaPayUrl = "{{ route('mpesa.pay') }}";
        const mpesaStatusTemplate = "{{ route('mpesa.status', ['checkoutRequestId' => 'CHECKOUT_ID']) }}";
        const checkoutNotice = document.getElementById('checkout-notice');
        const overlay = document.getElementById('payment-overlay');
        const overlayTitle = document.getElementById('overlay-title');
        const overlayMessage = document.getElementById('overlay-message');
        const overlayCountdown = document.getElementById('overlay-countdown');
        const overlayClose = document.getElementById('overlay-close');
        const payNowButton = document.getElementById('pay-now-button');
        const checkoutForm = document.getElementById('checkout-form');

        let countdownTimer;
        let pollInterval;
        let overlayCount = 0;
        let pollAttempts = 0;
        const pollLimit = 12;
        const countdownSeconds = 180;

        function formatCountdown(seconds) {
            const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
            const secs = String(seconds % 60).padStart(2, '0');
            return `${minutes}:${secs}`;
        }

        function showOverlay(title, message, seconds = countdownSeconds) {
            overlayTitle.textContent = title;
            overlayMessage.textContent = message;
            overlayCount = seconds;
            overlayCountdown.textContent = formatCountdown(seconds);
            overlay.classList.add('active');
            overlayClose.style.display = 'none';
            clearInterval(countdownTimer);
            countdownTimer = setInterval(() => {
                if (overlayCount <= 0) {
                    clearInterval(countdownTimer);
                    overlayCountdown.textContent = '00:00';
                    overlayMessage.textContent = 'Still waiting for your STK Push. Use the manual instructions or try again.';
                    overlayClose.style.display = 'inline-flex';
                    return;
                }
                overlayCount -= 1;
                overlayCountdown.textContent = formatCountdown(overlayCount);
            }, 1000);
        }

        function hideOverlay() {
            overlay.classList.remove('active');
            clearInterval(countdownTimer);
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        }

        overlayClose.addEventListener('click', () => {
            hideOverlay();
        });

        async function pollPaymentStatus(checkoutId) {
            if (!checkoutId) {
                return;
            }

            const statusUrl = mpesaStatusTemplate.replace('CHECKOUT_ID', encodeURIComponent(checkoutId));
            pollAttempts = 0;

            pollInterval = setInterval(async () => {
                pollAttempts += 1;
                if (pollAttempts > pollLimit) {
                    clearInterval(pollInterval);
                    overlayMessage.textContent = 'Payment confirmation timed out. Please check your M-Pesa app or use the fallback manual instructions.';
                    overlayClose.style.display = 'inline-flex';
                    return;
                }

                try {
                    const response = await fetch(statusUrl, { headers: { 'Accept': 'application/json' } });
                    if (!response.ok) {
                        return;
                    }
                    const data = await response.json();
                    if (!data.success) {
                        return;
                    }

                    if (data.status === 'success') {
                        clearInterval(pollInterval);
                        overlayTitle.textContent = 'Payment confirmed';
                        overlayMessage.textContent = 'Your M-Pesa payment is complete. Thank you for shopping with Baraka Solar Shop.';
                        overlayClose.style.display = 'inline-flex';
                        checkoutNotice.style.display = 'block';
                        checkoutNotice.style.borderColor = 'rgba(34,197,94,0.3)';
                        checkoutNotice.style.background = 'rgba(34,197,94,0.08)';
                        checkoutNotice.textContent = 'Payment confirmed. Your order is now being processed.';
                        return;
                    }

                    if (data.status === 'failed') {
                        clearInterval(pollInterval);
                        overlayTitle.textContent = 'Payment failed';
                        overlayMessage.textContent = data.result_desc || 'The payment was not completed. Please try again or use manual payment.';
                        overlayClose.style.display = 'inline-flex';
                        checkoutNotice.style.display = 'block';
                        checkoutNotice.style.borderColor = 'rgba(248,113,113,0.3)';
                        checkoutNotice.style.background = 'rgba(248,113,113,0.08)';
                        checkoutNotice.textContent = 'Payment failed. Please retry the payment or use the fallback instructions.';
                        return;
                    }
                } catch (error) {
                    console.warn('Payment status polling error', error);
                }
            }, 4000);
        }

        checkoutForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (payNowButton.disabled) {
                return;
            }

            const phoneInput = document.getElementById('phone-number');
            const phone = phoneInput.value.trim();
            if (!phone.match(/^2547[0-9]{8}$/)) {
                checkoutNotice.style.display = 'block';
                checkoutNotice.style.borderColor = 'rgba(248,113,113,0.3)';
                checkoutNotice.style.background = 'rgba(248,113,113,0.08)';
                checkoutNotice.textContent = 'Enter a valid Kenyan phone number in the format 2547XXXXXXXX.';
                return;
            }

            payNowButton.disabled = true;
            payNowButton.textContent = 'Sending request...';
            checkoutNotice.style.display = 'none';

            try {
                const response = await fetch(mpesaPayUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ phone, amount: {{ intval($cartTotal) }}, payment_method: document.getElementById('payment-method').value }),
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Unable to process payment request.');
                }

                const checkoutId = data.data?.CheckoutRequestID || data.data?.checkoutRequestID || data.checkout_request_id || data.checkoutRequestID || data.data?.checkout_request_id;
                const displayMessage = data.message || 'STK Push prompt triggered. Please confirm on your phone.';
                showOverlay('STK Push sent', displayMessage, countdownSeconds);

                if (checkoutId) {
                    pollPaymentStatus(checkoutId);
                } else {
                    overlayMessage.textContent = displayMessage + ' Your payment will be tracked manually if the callback is received.';
                    overlayClose.style.display = 'inline-flex';
                }
            } catch (error) {
                checkoutNotice.style.display = 'block';
                checkoutNotice.style.borderColor = 'rgba(248,113,113,0.3)';
                checkoutNotice.style.background = 'rgba(248,113,113,0.08)';
                checkoutNotice.textContent = error.message || 'STK Push request failed. Please try again.';
            } finally {
                payNowButton.disabled = false;
                payNowButton.textContent = 'Pay via M-Pesa';
            }
        });
    </script>
</body>
</html>
