// ==================== SIMBA I18N ====================
// Multi-language support for Simba 2.0
// Languages: English (en), French (fr), Kinyarwanda (rw)

const LANGUAGES = {
  en: 'English',
  fr: 'Français',
  rw: 'Kinyarwanda',
};

const i18n = {
  current: localStorage.getItem('simba_lang') || 'en',
  
  set(lang) {
    if (!LANGUAGES[lang]) lang = 'en';
    this.current = lang;
    localStorage.setItem('simba_lang', lang);
    this.updateUI();
  },
  
  t(key, params = {}) {
    const dict = TRANSLATIONS[this.current] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || key;
    
    // Replace {param} placeholders
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k]);
    });
    return text;
  },
  
  updateUI() {
    // Update all elements with data-t attribute
    document.querySelectorAll('[data-t]').forEach(el => {
      const key = el.getAttribute('data-t');
      if (key) el.textContent = this.t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-t-placeholder]').forEach(el => {
      const key = el.getAttribute('data-t-placeholder');
      if (key) el.placeholder = this.t(key);
    });
    
    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(el => {
      el.classList.toggle('active', el.dataset.lang === this.current);
    });
    
    // Trigger custom event for components
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: this.current } }));
  },
};

window.i18n = i18n;
window.LANGUAGES = LANGUAGES;

// Shortcut function
function t(key, params) { return i18n.t(key, params); }
function setLang(lang) { i18n.set(lang); }

// ==================== TRANSLATIONS ====================
const TRANSLATIONS = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_shop: 'Shop',
    nav_orders: 'Orders',
    nav_profile: 'Profile',
    nav_checkout: 'Checkout',
    nav_wishlist: 'Wishlist',
    nav_login: 'Sign In',
    nav_register: 'Register',
    nav_logout: 'Sign Out',
    cart: 'Cart',
    
    // Filters/Search
    filters: 'Filters',
    in_stock_only: 'In Stock Only',
    max_price: 'Max Price',
    sort_by: 'Sort by',
    sort_featured: 'Featured',
    sort_low: 'Price: Low to High',
    sort_high: 'Price: High to Low',
    sort_name: 'Name A–Z',
    products: 'products',
    no_results: 'No products found',
    try_again: 'Try a different search or adjust your filters.',
    clear_all: 'Clear All Filters',
    
    // Hero/Home
    hero_title: 'Your Neighborhood Supermarket',
    hero_subtitle: 'Fresh groceries delivered to your doorstep in Kigali',
    cta_shop: 'Start Shopping',
    cta_branch: 'Find a Branch',
    
    // Categories
    cat_all: 'All Products',
    cat_food: 'Food Products',
    cat_drinks: 'Drinks',
    cat_baby: 'Baby Products',
    cat_cosmetics: 'Cosmetics',
    cat_cleaning: 'Cleaning',
    cat_electronics: 'Electronics',
    cat_stationery: 'Stationery',
    
    // Product listing
    search_products: 'Search products...',
    filter_products: 'Filter',
    sort_products: 'Sort',
    price_high: 'Price: High to Low',
    price_low: 'Price: Low to High',
    newest_first: 'Newest First',
    results_found: 'Found {count} products',
    no_products: 'No products found',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    new_product: 'NEW',
    hot_product: 'Hot',
    
    // Product detail
    add_to_cart: 'Add to Cart',
    added_to_cart: 'Added to cart!',
    buy_now: 'Buy Now',
    product_description: 'Description',
    product_reviews: 'Reviews',
    related_products: 'Related Products',
    write_review: 'Write a Review',
    
    // Cart
    cart_title: 'Shopping Cart',
    cart_empty: 'Your cart is empty',
    cart_empty_sub: 'Add some products to get started',
    continue_shopping: 'Continue Shopping',
    cart_subtotal: 'Subtotal',
    cart_total: 'Total',
    cart_checkout: 'Proceed to Checkout',
    cart_remove: 'Remove',
    cart_update: 'Update quantity',
    
    // Checkout
    checkout_title: 'Checkout',
    checkout_step1: 'Your Details',
    checkout_step2: 'Pick-up',
    checkout_step3: 'Payment',
    checkout_confirm: 'Confirm',
    checkout_name: 'Full Name',
    checkout_phone: 'Phone Number',
    checkout_branch: 'Pick-up Branch',
    checkout_slot: 'Pick-up Time',
    checkout_notes: 'Order Notes (optional)',
    checkout_pay: 'Pay Now',
    checkout_success: 'Order Placed Successfully!',
    checkout_order_ref: 'Order Reference',
    checkout_thanks: 'Thank you for your order!',
    
    // Payment
    pay_momo: 'Pay with MoMo',
    pay_card: 'Pay with Card',
    pay_enter_pin: 'Enter MoMo PIN',
    pay_processing: 'Processing payment...',
    pay_confirming: 'Confirming payment...',
    pay_success: 'Payment successful!',
    pay_failed: 'Payment failed',
    
    // Orders
    orders_title: 'My Orders',
    orders_empty: 'No orders yet',
    orders_empty_sub: 'Your order history will appear here',
    order_tracking: 'Track Order',
    order_reorder: 'Reorder',
    order_cancel: 'Cancel Order',
    order_details: 'Order Details',
    order_status: 'Status',
    order_total: 'Total',
    order_date: 'Date',
    order_items: 'Items',
    
    // Order statuses
    status_pending: 'Pending',
    status_confirmed: 'Confirmed',
    status_preparing: 'Preparing',
    status_ready: 'Ready for Pick-up',
    status_picked: 'Picked Up',
    status_cancelled: 'Cancelled',
    
    // Wishlist
    wishlist_title: 'My Wishlist',
    wishlist_empty: 'Your wishlist is empty',
    wishlist_empty_sub: 'Save products you love for later',
    added_to_wishlist: 'Added to wishlist',
    removed_from_wishlist: 'Removed from wishlist',
    
    // Auth
    auth_login: 'Sign In',
    auth_register: 'Create Account',
    auth_phone: 'Phone Number',
    auth_password: 'Password',
    auth_name: 'Full Name',
    auth_forgot: 'Forgot password?',
    auth_no_account: "Don't have an account?",
    auth_has_account: 'Already have an account?',
    auth_login_btn: 'Sign In',
    auth_register_btn: 'Create Account',
    auth_otp_sent: 'Verification code sent',
    
    // Dashboard (Market Rep)
    dashboard_title: 'Dashboard',
    dashboard_orders: 'Orders',
    dashboard_inventory: 'Inventory',
    dashboard_reviews: 'Reviews',
    kpi_today: "Today's Orders",
    kpi_revenue: "Today's Revenue",
    kpi_pending: 'Pending Orders',
    kpi_products: 'Products',
    
    // Auth page
    feat1_title: '552 Products',
    feat1_desc: 'Food, drinks, beauty, electronics and more',
    feat2_title: '9 Kigali Branches',
    feat2_desc: 'Remera, Kimironko, Kacyiru and 6 more',
    feat3_title: 'MTN MoMo Payment',
    feat3_desc: 'Fast, secure, no cash needed',
    tab_login: 'Sign In',
    tab_register: 'Register',
    login_title: 'Welcome back',
    login_sub: 'Sign in to your Simba account',
    btn_google: 'Continue with Google',
    or: 'or sign in with email',
    label_email: 'Email address',
    label_password: 'Password',
    forgot_link: 'Forgot password?',
    btn_login: 'Sign In',
    switch_to_register: "Don't have an account? Register",
    register_title: 'Create account',
    register_sub: 'Join Simba 2.0 — it\'s free',
    register_success_msg: 'Account created! Redirecting to shop...',
    or_register: 'or register with email',
    label_fullname: 'Full Name',
    label_phone: 'Phone (MTN MoMo)',
    label_confirm_pw: 'Confirm Password',
    btn_register: 'Create Account',
    switch_to_login: 'Already have an account? Sign In',
    back_to_login: 'Back to Sign In',
    forgot_title: 'Reset Password',
    forgot_sub: 'Enter your email and we\'ll send you a reset link.',
    btn_send_reset: 'Send Reset Link',
    reset_sent_title: 'Check your inbox!',
    reset_sent_msg: 'We sent a password reset link to your email.',
    
    // Orders page
    total_orders: 'Total Orders',
    total_spent: 'Total Spent',
    
    // Dashboard page
    nav_overview: 'Overview',
    nav_dashboard: 'Dashboard',
    nav_operations: 'Operations',
    nav_inventory: 'Inventory',
    nav_reviews: 'Reviews',
    nav_system: 'System',
    nav_shop: 'View Shop',
    role_manager: 'Branch Manager',
    recent_orders: 'Recent Orders',
    view_all: 'View All',
    all_orders: 'All Orders',
    filter_all: 'All',
    filter_pending: 'Pending',
    filter_confirmed: 'Confirmed',
    filter_ready: 'Ready',
    filter_picked: 'Picked Up',
    inventory_title: 'Branch Inventory',
    add_product: 'Add Product',
    show_oos: 'Out of Stock Only',
    reviews_title: 'Customer Reviews',
    order_detail: 'Order Details',
    prod_name: 'Product Name',
    prod_price: 'Price (RWF)',
    prod_category: 'Category',
    prod_unit: 'Unit',
    prod_image: 'Image URL (optional)',
    prod_in_stock: 'In Stock',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    
    // Contact
    contact_title: 'Contact Us',
    contact_call: 'Call Us',
    contact_whatsapp: 'WhatsApp',
    contact_email: 'Email',
    contact_branches: 'Our Branches',
  },
  
  fr: {
    // Navigation
    nav_home: 'Accueil',
    nav_shop: 'Boutique',
    nav_orders: 'Commandes',
    nav_profile: 'Profil',
    nav_checkout: 'Paiement',
    nav_wishlist: 'Favoris',
    nav_login: 'Connexion',
    nav_register: "S'inscrire",
    nav_logout: 'Déconnexion',
    cart: 'Panier',
    
    // Filters/Search
    filters: 'Filtres',
    in_stock_only: 'En stock seulement',
    max_price: 'Prix max',
    sort_by: 'Trier par',
    sort_featured: 'Phare',
    sort_low: 'Prix: Croissant',
    sort_high: 'Prix: Décroissant',
    sort_name: 'Nom A–Z',
    products: 'produits',
    no_results: 'Aucun produit trouvé',
    try_again: 'Essayez une autre recherche.',
    clear_all: 'Tout effacer',
    
    // Hero/Home
    hero_title: 'Votre Supermarché de Quartier',
    hero_subtitle: 'Épiceries frais livrées à votre porte à Kigali',
    cta_shop: 'Commencer vos achats',
    cta_branch: 'Trouver une succursale',
    
    // Categories
    cat_all: 'Tous les produits',
    cat_food: 'Produits alimentaires',
    cat_drinks: 'Boissons',
    cat_baby: 'Produits bébé',
    cat_cosmetics: 'Cosmétiques',
    cat_cleaning: 'Nettoyage',
    cat_electronics: 'Électronique',
    cat_stationery: 'Papeterie',
    
    // Product listing
    search_products: 'Rechercher des produits...',
    filter_products: 'Filtrer',
    sort_products: 'Trier',
    price_high: 'Prix: Croissant',
    price_low: 'Prix: Décroissant',
    newest_first: 'Plus récents',
    results_found: '{count} produits trouvés',
    no_products: 'Aucun produit trouvé',
    in_stock: 'En stock',
    out_of_stock: 'Rupture de stock',
    new_product: 'NOUVEAU',
    hot_product: '🔥',
    
    // Product detail
    add_to_cart: 'Ajouter au panier',
    added_to_cart: 'Ajouté au panier !',
    buy_now: 'Acheter maintenant',
    product_description: 'Description',
    product_reviews: 'Avis',
    related_products: 'Produits similaires',
    write_review: 'Écrire un avis',
    
    // Cart
    cart_title: 'Panier',
    cart_empty: 'Votre panier est vide',
    cart_empty_sub: 'Ajoutez des produits pour commencer',
    continue_shopping: 'Continuer vos achats',
    cart_subtotal: 'Sous-total',
    cart_total: 'Total',
    cart_checkout: 'Passer à la caisse',
    cart_remove: 'Supprimer',
    cart_update: 'Modifier la quantité',
    
    // Checkout
    checkout_title: 'Caisse',
    checkout_step1: 'Vos coordonnées',
    checkout_step2: 'Retrait',
    checkout_step3: 'Paiement',
    checkout_confirm: 'Confirmer',
    checkout_name: 'Nom complet',
    checkout_phone: 'Numéro de téléphone',
    checkout_branch: 'Point de retrait',
    checkout_slot: 'Heure de retrait',
    checkout_notes: 'Notes (optionnel)',
    checkout_pay: 'Payer maintenant',
    checkout_success: 'Commande passée avec succès !',
    checkout_order_ref: 'Référence',
    checkout_thanks: 'Merci pour votre commande !',
    
    // Payment
    pay_momo: 'Payer avec MoMo',
    pay_card: 'Payer par carte',
    pay_enter_pin: 'Entrer le PIN MoMo',
    pay_processing: 'Traitement du paiement...',
    pay_confirming: 'Confirmation...',
    pay_success: 'Paiement réussi !',
    pay_failed: 'Paiement échoué',
    
    // Orders
    orders_title: 'Mes commandes',
    orders_empty: 'Aucune commande',
    orders_empty_sub: 'Votre historique de commandes apparaîtra ici',
    order_tracking: 'Suivre la commande',
    order_reorder: 'Commander à nouveau',
    order_cancel: 'Annuler',
    order_details: 'Détails',
    order_status: 'Statut',
    order_total: 'Total',
    order_date: 'Date',
    order_items: 'Articles',
    
    // Order statuses
    status_pending: 'En attente',
    status_confirmed: 'Confirmée',
    status_preparing: 'En préparation',
    status_ready: 'Prête',
    status_picked: 'Retirée',
    status_cancelled: 'Annulée',
    
    // Wishlist
    wishlist_title: 'Mes favoris',
    wishlist_empty: 'Vos favoris sont vides',
    wishlist_empty_sub: 'Enregistrez vos produits préférés',
    added_to_wishlist: 'Ajouté aux favoris',
    removed_from_wishlist: 'Retiré des favoris',
    
    // Auth
    auth_login: 'Connexion',
    auth_register: 'Créer un compte',
    auth_phone: 'Téléphone',
    auth_password: 'Mot de passe',
    auth_name: 'Nom complet',
    auth_forgot: 'Mot de passe oublié ?',
    auth_no_account: 'Pas de compte ?',
    auth_has_account: 'Déjà un compte ?',
    auth_login_btn: 'Se connecter',
    auth_register_btn: 'Créer le compte',
    auth_otp_sent: 'Code de vérification envoyé',
    
    // Dashboard (Market Rep)
    dashboard_title: 'Tableau de bord',
    dashboard_orders: 'Commandes',
    dashboard_inventory: 'Inventaire',
    dashboard_reviews: 'Avis',
    kpi_today: "Commandes aujourd'hui",
    kpi_revenue: "Chiffre d'affaires",
    kpi_pending: 'En attente',
    kpi_products: 'Produits',
    
    // Auth page
    feat1_title: '552 Produits',
    feat1_desc: 'Alimentation, boissons, beauté et plus',
    feat2_title: '9 Succursales Kigali',
    feat2_desc: 'Remera, Kimironko, Kacyiru et 6 autres',
    feat3_title: 'Paiement MTN MoMo',
    feat3_desc: 'Rapide, sécurisé, pas de cash',
    tab_login: 'Connexion',
    tab_register: "S'inscrire",
    login_title: 'Bon retour',
    login_sub: 'Connectez-vous à votre compte Simba',
    btn_google: 'Continuer avec Google',
    or: 'ou connectez-vous avec email',
    label_email: 'Adresse email',
    label_password: 'Mot de passe',
    forgot_link: 'Mot de passe oublié ?',
    btn_login: 'Se connecter',
    switch_to_register: 'Pas de compte ? Inscrivez-vous',
    register_title: 'Créer un compte',
    register_sub: 'Rejoignez Simba 2.0 — c\'est gratuit',
    register_success_msg: 'Compte créé ! Redirection vers la boutique...',
    or_register: 'ou inscrivez-vous avec email',
    label_fullname: 'Nom complet',
    label_phone: 'Téléphone (MTN MoMo)',
    label_confirm_pw: 'Confirmer le mot de passe',
    btn_register: 'Créer le compte',
    switch_to_login: 'Déjà un compte ? Connectez-vous',
    back_to_login: 'Retour à la connexion',
    forgot_title: 'Réinitialiser le mot de passe',
    forgot_sub: 'Entrez votre email et nous vous enverrons un lien.',
    btn_send_reset: 'Envoyer le lien',
    reset_sent_title: 'Vérifiez votre inbox !',
    reset_sent_msg: 'Nous avons envoyé un lien à votre email.',
    
    // Orders page
    total_orders: 'Total commandes',
    total_spent: 'Total dépensé',
    
    // Dashboard page
    nav_overview: 'Aperçu',
    nav_dashboard: 'Tableau de bord',
    nav_operations: 'Opérations',
    nav_inventory: 'Inventaire',
    nav_reviews: 'Avis',
    nav_system: 'Système',
    nav_shop: 'Voir la boutique',
    role_manager: 'Gérant de succursale',
    recent_orders: 'Commandes récentes',
    view_all: 'Voir tout',
    all_orders: 'Toutes les commandes',
    filter_all: 'Tous',
    filter_pending: 'En attente',
    filter_confirmed: 'Confirmée',
    filter_ready: 'Prête',
    filter_picked: 'Retirée',
    inventory_title: 'Inventaire de la succursale',
    add_product: 'Ajouter un produit',
    show_oos: 'Rupture de stock',
    reviews_title: 'Avis clients',
    order_detail: 'Détails de la commande',
    prod_name: 'Nom du produit',
    prod_price: 'Prix (RWF)',
    prod_category: 'Catégorie',
    prod_unit: 'Unité',
    prod_image: 'URL image (optionnel)',
    prod_in_stock: 'En stock',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    retry: 'Réessayer',
    
    // Contact
    contact_title: 'Nous contacter',
    contact_call: 'Appeler',
    contact_whatsapp: 'WhatsApp',
    contact_email: 'Email',
    contact_branches: 'Nos succursales',
  },
  
  rw: {
    // Navigation
    nav_home: 'Ahabanza',
    nav_shop: 'Isoko',
    nav_orders: 'Ibyuririwe',
    nav_profile: 'Profil',
    nav_checkout: 'Kwishyura',
    nav_wishlist: 'Ibikunda',
    nav_login: 'Injira',
    nav_register: 'Iyandikishe',
    nav_logout: 'Sohoka',
    cart: 'Gasanduku',
    title: 'Ibikunda byanjye',
    subtitle: 'Fungura ibicuruzwa wishakunye',
    my_orders: 'Ibyuririwe byanjye',
    order_history: 'Ibyo wakurikiye',
    total_orders: 'Ibyuririwe byose',
    total_spent: 'Amafaranga watswe',
    
    // Filters/Search
    filters: 'Filter',
    in_stock_only: 'Hariho gusa',
    max_price: 'Igiciro max',
    sort_by: 'Tonganya',
    sort_featured: 'Ishusho',
    sort_low: 'Igiciro:ijya hasi',
    sort_high: 'Igiciro:hejye',
    sort_name: 'Amazina',
    products: 'ibicuruzwa',
    no_results: 'Nta bicuruzwa byabonetse',
    try_again: 'Shakisha ikindi.',
    clear_all: 'Funguya byose',
    
    // Hero/Home
    hero_title: 'Supermarketi yawe',
    hero_subtitle: 'Ibinyoroshye biriwigeye mu rugo rwifite muri Kigali',
    cta_shop: 'Tangira Kugura',
    cta_branch: 'Shakira umurenge',
    
    // Categories
    cat_all: 'Ibicuruzwa byose',
    cat_food: 'Ibikari',
    cat_drinks: 'Imigati',
    cat_baby: 'Ibiro byoroshye',
    cat_cosmetics: 'Ibikaranishonga',
    cat_cleaning: 'Kumesa',
    cat_electronics: 'Ibiro bya korosi',
    cat_stationery: 'Igikoresho gishushanyo',
    
    // Product listing
    search_products: 'Shakisha ibicuruzwa...',
    filter_products: 'Filter',
    sort_products: 'Tonganya',
    price_high: 'Igiciro:.hejye',
    price_low: 'Igiciro:ijya hasi',
    newest_first: 'Ibishusho',
    results_found: 'Ibicuruzwa {count} byabonetse',
    no_products: 'Nta bicuruzwa byabonetse',
    in_stock: 'Hariho',
    out_of_stock: 'Ntibihari',
    new_product: 'ISHUSH',
    hot_product: '🔥',
    
    // Product detail
    add_to_cart: 'Funguranya',
    added_to_cart: 'Fungujewe!',
    buy_now: 'Gura none',
    product_description: 'Ibitekerezo',
    product_reviews: 'Ibyo bakubwiye',
    related_products: 'Ibicuruzwa bibana',
    write_review: 'wandika ikibazo',
    
    // Cart
    cart_title: 'Gasanduku',
    cart_empty: 'Gasanduku yawe iri ho',
    cart_empty_sub: 'Fungura ibicuruzwa winjire',
    continue_shopping: 'Komeza ukugura',
    cart_subtotal: 'Igiciro cose',
    cart_total: 'Igiciro cyose',
    cart_checkout: 'Komeza kuri checkout',
    cart_remove: 'Funguza',
    cart_update: 'Hindura ingano',
    
    // Checkout
    checkout_title: 'Kwishyura',
    checkout_step1: 'Amakuru yawe',
    checkout_step2: 'aho uzafata',
    checkout_step3: 'Kwishyura',
    checkout_confirm: 'Emeza',
    checkout_name: 'Amazina yuzuye',
    checkout_phone: 'Nomero ya telephone',
    checkout_branch: 'Umurenge wo kugura',
    checkout_slot: 'igihe wo kugura',
    checkout_notes: 'amagambo (bifashisho)',
    checkout_pay: 'ISHYURA',
    checkout_success: 'Ibyuririwe byagenze neza!',
    checkout_order_ref: 'Nimero yorder',
    checkout_thanks: 'Murakoze kubuyoboles!',
    
    // Payment
    pay_momo: 'isha MoMo',
    pay_card: 'isha Card',
    pin_enter: 'Injira MoMo PIN',
    pay_processing: 'Processing...',
    pay_confirming: 'Confirming...',
    pay_success: 'Byagenze!',
    pay_failed: 'Byanze',
    
    // Orders
    orders_title: 'Ibyuririwe byanjye',
    orders_empty: 'Nta byuririwe',
    orders_empty_sub: 'Ibyuririwe yawe bizagaruka hano',
    order_tracking: 'Fata ibyuririwe',
    order_reorder: 'Ongera utumire',
    order_cancel: 'Futa',
    order_details: 'Ibice',
    order_status: 'Status',
    order_total: 'Igiciro',
    order_date: 'Itariki',
    order_items: 'Ibicuruzwa',
    
    // Order statuses
    status_pending: 'Ibirahishije',
    status_confirmed: 'Byemejwe',
    status_preparing: 'Birakora',
    status_ready: 'Ibyitezwe',
    status_picked: 'Byaguzwe',
    status_cancelled: 'Byavuye',
    
    // Wishlist
    wishlist_title: 'Ibikunda byanjye',
    wishlist_empty: 'Nta kikunda',
    wishlist_empty_sub: 'Fungura ibicuruzwa wishakunze',
    added_to_wishlist: 'Byongejwe kugikunda',
    removed_from_wishlist: 'Byasibutse mugikunda',
    
    // Auth
    auth_login: 'Injira',
    auth_register: 'Fungura konti',
    auth_phone: 'Telephone',
    auth_password: 'Ijambobanga',
    auth_name: 'Amazina yuzuye',
    auth_forgot: 'Wibye ijambobanga?',
    auth_no_account: 'Nta konti?',
    auth_has_account: 'Ifite konti?',
    auth_login_btn: 'Injira',
    auth_register_btn: 'Fungura konti',
    auth_otp_sent: 'Code yoherejwe',
    
    // Dashboard (Market Rep)
    dashboard_title: 'Ikibaho',
    dashboard_orders: 'Ibyuririwe',
    dashboard_inventory: 'Ibicuruzwa',
    dashboard_reviews: 'Ibyo bakubwiye',
    kpi_today: 'Ibyuririwe uyu munsi',
    kpi_revenue: 'Amafaranga uyu munsi',
    kpi_pending: 'Ibirahishije',
    kpi_products: 'Ibicuruzwa',
    
    // Auth page
    feat1_title: '552 PRODUCTS',
    feat1_desc: 'Ibikari, imigati, ibikaranishonga, ndetse',
    feat2_title: '9 IMIDRISI KIGALI',
    feat2_desc: 'Remera, Kimironko, Kacyiru nindaya 6',
    feat3_title: 'MTN MoMo',
    fg3_desc: 'Byoroshye, birakingukiye, ntakigenge',
    tab_login: 'Injira',
    tab_register: 'Iyandikishe',
    login_title: 'Murakwinze',
    login_sub: 'Injira kuri konti yawe Simba',
    btn_google: 'Fungura na Google',
    or: 'cyangwa injira na email',
    label_email: 'Email',
    label_password: 'Ijambobanga',
    forgot_link: 'Wibye ijambobanga?',
    btn_login: 'Injira',
    switch_to_register: 'Nta konti? Register',
    register_title: 'Fungura konti',
    register_sub: 'Join Simba 2.0 — ntakurangu',
    register_success_msg: 'Konti yakorewe! Rija ku isoko...',
    or_register: 'cyangwa iyandikishe na email',
    label_fullname: 'Amazina yuzuye',
    label_phone: 'Telephone (MTN MoMo)',
    label_confirm_pw: 'Emeza ijambobanga',
    btn_register: 'Fungura konti',
    switch_to_login: 'Ifite konti? Injira',
    back_to_login: 'Subira kuri login',
    forgot_title: ' Hindura ijambobanga',
    forgot_sub: 'Injira email yawe tukwerekeza link.',
    btn_send_reset: 'Send Reset Link',
    reset_sent_title: 'Reba inbox yawe!',
    reset_sent_msg: 'Link yoherejwe kuri email yawe.',
    
    // Orders page
    total_orders: 'Ibyuririwe byose',
    total_spent: 'Amafaranga watswe',
    
    // Dashboard page
    nav_overview: 'Ibyerekeye',
    nav_dashboard: 'Ikibaho',
    nav_operations: 'Ibikorwa',
    nav_inventory: 'Ibicuruzwa',
    nav_reviews: 'Ibyo bakubwiye',
    nav_system: 'Sistema',
    nav_shop: 'Jacobu Isoko',
    role_manager: 'Umuyobozi w umurenge',
    recent_orders: 'Ibyuririwe biheruka',
    view_all: 'Bona byose',
    all_orders: 'Ibyuririwe byose',
    filter_all: 'Byose',
    filter_pending: 'Birahishije',
    filter_confirmed: 'Byemejwe',
    filter_ready: 'Biritegwa',
    filter_picked: 'Byaguzwe',
    inventory_title: 'Ibicuruzwa mu umurenge',
    add_product: 'Fungura igicuruzwa',
    show_oos: 'Ntibihari gusa',
    reviews_title: 'Ibyo abarengashije bakubwiye',
    order_detail: 'Ibice by order',
    prod_name: 'Izina ry\'igicuruzwa',
    prod_price: 'Igiciro (RWF)',
    prod_category: 'Category',
    prod_unit: 'Unit',
    prod_image: 'URL y igituku (optionnel)',
    prod_in_stock: 'Hariho',
    
    // Common
    save: 'Bika',
    cancel: 'Gaba',
    delete: 'Funguza',
    edit: 'Hindura',
    close: 'Funga',
    confirm: 'Emeza',
    loading: 'Loading...',
    error: 'Ikosa',
    success: 'Byagenze',
    retry: ' retry',
    
    // Contact
    contact_title: 'Twifune',
    contact_call: 'Hamagara',
    contact_whatsapp: 'WhatsApp',
    contact_email: 'Email',
    contact_branches: 'Imidrisi',
  },
};

window.TRANSLATIONS = TRANSLATIONS;

// Auto-init translations on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.updateUI());
} else {
  i18n.updateUI();
}