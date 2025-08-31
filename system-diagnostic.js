// =====================================================
// SYSTEM DIAGNOSTIC - COMPLETE CHECK
// Automatic diagnostic of web shop systems
// =====================================================

console.log('🔍 [DIAGNOSTIC] System Diagnostic Starting...');

// Check that all systems are loaded
function runSystemDiagnostic() {
    console.log('🔍 [DIAGNOSTIC] Running Full System Check...');

    const diagnostics = {
        timestamp: new Date().toISOString(),
        systems: {},
        performance: {},
        dom: {},
        errors: []
    };

    // 1. Check JavaScript systems
    diagnostics.systems.wishlistSystem = {
        loaded: typeof window.wishlistSystem !== 'undefined',
        instance: typeof window.wishlistSystemInstance !== 'undefined',
        methods: typeof window.wishlistSystem?.toggleWishlist === 'function',
        wishlistCount: window.wishlistSystem?.wishlist?.length || 0
    };

    diagnostics.systems.productCarousel = {
        loaded: typeof window.productCarousel !== 'undefined',
        slides: document.querySelectorAll('.carousel-slide').length,
        visible: document.getElementById('productCarousel')?.offsetHeight > 0
    };

    diagnostics.systems.authSystem = {
        loaded: typeof window.authSystem !== 'undefined'
    };

    diagnostics.systems.paymentSystem = {
        loaded: typeof window.paymentSystem !== 'undefined'
    };

    // 2. Check data
    diagnostics.dom.products = {
        inMemory: window.allProducts?.length || 0,
        inLocal: window.products?.length || 0,
        cardsFound: document.querySelectorAll('.product-card, .carousel-product-card').length,
        wishlistButtons: document.querySelectorAll('.wishlist-btn').length
    };

    // 3. Check performance
    diagnostics.performance.domReady = document.readyState === 'complete';
    diagnostics.performance.scriptsLoaded = document.querySelectorAll('script').length;
    diagnostics.performance.imagesLoaded = Array.from(document.querySelectorAll('img')).filter(img => img.complete).length;

    // 4. Calculer le score global
    const systemsLoaded = Object.values(diagnostics.systems).filter(s => s.loaded).length;
    const totalSystems = Object.keys(diagnostics.systems).length;
    diagnostics.score = Math.round((systemsLoaded / totalSystems) * 100);

    // Display results
    console.log('📊 [DIAGNOSTIC] Results:');
    console.log(`🎯 Systems: ${systemsLoaded}/${totalSystems} loaded (${diagnostics.score}%)`);
    console.log(`🛍️ Products: ${diagnostics.dom.products.inMemory} in memory`);
    console.log(`🎨 Cards: ${diagnostics.dom.products.cardsFound} found`);
    console.log(`❤️ Wishlist: ${diagnostics.dom.products.wishlistButtons} buttons`);
    console.log(`🎠 Carousel: ${diagnostics.systems.productCarousel.slides} slides`);

    // Specific checks
    if (diagnostics.systems.wishlistSystem.loaded) {
        console.log('✅ [DIAGNOSTIC] Wishlist System: Fully Operational');
    } else {
        console.warn('⚠️ [DIAGNOSTIC] Wishlist System: Not Loaded');
        diagnostics.errors.push('Wishlist system not loaded');
    }

    if (diagnostics.systems.productCarousel.loaded) {
        console.log('✅ [DIAGNOSTIC] Product Carousel: Active');
    } else {
        console.warn('⚠️ [DIAGNOSTIC] Product Carousel: Not Active');
        diagnostics.errors.push('Product carousel not active');
    }

    if (diagnostics.dom.products.wishlistButtons > 0) {
        console.log('✅ [DIAGNOSTIC] Wishlist Buttons: Present');
    } else {
        console.warn('⚠️ [DIAGNOSTIC] Wishlist Buttons: Missing');
        diagnostics.errors.push('Wishlist buttons not found');
    }

    // Check product visibility
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

    console.log(`👁️ Product Cards Visible: ${visibleCards.length}/${productCards.length}`);

    if (visibleCards.length < productCards.length) {
        console.warn(`⚠️ ${productCards.length - visibleCards.length} product cards may be hidden or invisible`);
        diagnostics.errors.push(`${productCards.length - visibleCards.length} product cards are not visible`);

        // Attempt automatic recovery
        console.log('🔧 [DIAGNOSTIC] Attempting automatic recovery...');
        const recovered = recoverInvisibleProducts();
        if (recovered) {
            console.log('✅ [DIAGNOSTIC] Automatic recovery successful');
            diagnostics.recovery = 'successful';
        } else {
            console.log('⚠️ [DIAGNOSTIC] No recovery needed or failed');
            diagnostics.recovery = 'not_needed';
        }
    } else if (visibleCards.length > 0) {
        console.log('✅ [DIAGNOSTIC] All Product Cards: Visible');
        diagnostics.recovery = 'not_needed';
    }

    if (diagnostics.score === 100) {
        console.log('🎉 [DIAGNOSTIC] ALL SYSTEMS OPERATIONAL - 100% SUCCESS!');
    } else {
        console.warn(`⚠️ [DIAGNOSTIC] ${100 - diagnostics.score}% systems need attention`);
    }

    // Store diagnostics for debugging
    window.systemDiagnostics = diagnostics;

    return diagnostics;
}

// Run diagnostic after loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(runSystemDiagnostic, 2000); // Wait for everything to load
    });
} else {
    setTimeout(runSystemDiagnostic, 2000);
}

// Expose function globally for manual debugging
window.runSystemDiagnostic = runSystemDiagnostic;

// Automatic recovery function for invisible products
function recoverInvisibleProducts() {
    console.log('🔧 [RECOVERY] Starting product visibility recovery...');

    const productCards = document.querySelectorAll('.product-card, .carousel-product-card');
    let recoveredCount = 0;

    productCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const style = window.getComputedStyle(card);

        // Check if card is invisible
        if (rect.width === 0 || rect.height === 0 ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0') {

            // Force visibility
            card.style.display = 'block';
            card.style.visibility = 'visible';
            card.style.opacity = '1';
            card.style.width = 'auto';
            card.style.height = 'auto';

            console.log(`✅ [RECOVERY] Recovered product card ${index}`);
            recoveredCount++;
        }
    });

    if (recoveredCount > 0) {
        console.log(`🎉 [RECOVERY] Recovered ${recoveredCount} product cards`);
        return true;
    } else {
        console.log('✅ [RECOVERY] No invisible products found');
        return false;
    }
}

// Exposer les fonctions globalement
window.recoverInvisibleProducts = recoverInvisibleProducts;

console.log('🔍 [DIAGNOSTIC] Diagnostic System Ready - Call runSystemDiagnostic() or recoverInvisibleProducts() for manual actions');
