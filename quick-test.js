// =====================================================
// QUICK TEST - FAST VERIFICATION OF CORRECTIONS
// =====================================================

console.log('🧪 [QUICK TEST] Starting quick system test...');

// Test 1: Check that systems are loaded
console.log('1️⃣ Testing system loading...');
const systemsStatus = {
    wishlist: typeof window.wishlistSystem !== 'undefined',
    carousel: typeof window.productCarousel !== 'undefined',
    products: window.allProducts?.length > 0,
    cards: document.querySelectorAll('.product-card, .carousel-product-card').length,
    buttons: document.querySelectorAll('.wishlist-btn').length
};

console.log('📊 Systems Status:', systemsStatus);

// Test 2: Check product visibility
console.log('2️⃣ Testing product visibility...');
const productCards = document.querySelectorAll('.product-card, .carousel-product-card');
const visibleCards = Array.from(productCards).filter(card => {
    const rect = card.getBoundingClientRect();
    const style = window.getComputedStyle(card);
    return rect.width > 0 &&
           rect.height > 0 &&
           style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
});

console.log(`👁️ Visible cards: ${visibleCards.length}/${productCards.length}`);

// Test 3: Automatic recovery if necessary
if (visibleCards.length < productCards.length) {
    console.log('3️⃣ Attempting recovery...');
    if (window.recoverInvisibleProducts) {
        window.recoverInvisibleProducts();
    } else {
        console.warn('⚠️ Recovery function not available');
    }
}

// Test 4: Final verification
setTimeout(() => {
    const finalCards = document.querySelectorAll('.product-card, .carousel-product-card');
    const finalVisible = Array.from(finalCards).filter(card => {
        const rect = card.getBoundingClientRect();
        const style = window.getComputedStyle(card);
        return rect.width > 0 &&
               rect.height > 0 &&
               style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0';
    });

    console.log('4️⃣ Final check:');
    console.log(`✅ Systems loaded: ${systemsStatus.wishlist && systemsStatus.carousel ? 'YES' : 'NO'}`);
    console.log(`✅ Products available: ${systemsStatus.products ? 'YES' : 'NO'}`);
    console.log(`✅ Cards visible: ${finalVisible.length}/${finalCards.length}`);

    if (finalVisible.length === finalCards.length && systemsStatus.wishlist && systemsStatus.carousel) {
        console.log('🎉 [QUICK TEST] ALL TESTS PASSED - System is working perfectly!');
    } else {
        console.warn('⚠️ [QUICK TEST] Some issues detected - check diagnostic for details');
        if (window.runSystemDiagnostic) {
            window.runSystemDiagnostic();
        }
    }
}, 1000);

console.log('🧪 [QUICK TEST] Test completed - check results above');
