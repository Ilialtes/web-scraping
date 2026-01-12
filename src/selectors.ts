export const AMAZON_SELECTORS = {
    TITLE: 'span#productTitle',
    PRICE: [
        '#corePrice_feature_div .a-offscreen',
        '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
        '.a-price .a-offscreen',
        '#price', 
        '.a-color-price' 
    ],
    RATING: [
        'i[data-hook="average-star-rating"] span',
        'i.a-icon-star span',
        '#acrPopover span.a-icon-alt'
    ],
    REVIEWS: [
        '[data-hook="total-review-count"]',
        '#acrCustomerReviewText' 
    ],
    DESCRIPTION: {
        BULLETS: '#feature-bullets li span.a-list-item',
        BOOK_CONTAINERS: [
            '[data-feature-name="bookDescription"] .a-expander-content',
            '#bookDescription_feature_div div[data-action="a-expander-toggle"] + div',
            '#bookDescription_feature_div'
        ]
    },
    LOCATION: {
        WIDGET: '#nav-global-location-popover-link, #nav-global-location-slot',
        INPUT: '#GLUXZipUpdateInput, input[aria-label="or enter a US zip code"]',
        APPLY_BTN: '#GLUXZipUpdate input[type="submit"], #GLUXZipUpdate-announce',
        DONE_BTNS: [
            'button[name="glowDoneButton"]',
            '#GLUXConfirmClose',
            '[name="glowDoneButton"]',
            'button:has-text("Done")',
            'button:has-text("Continue")'
        ]
    }
};

export const WALMART_SELECTORS = {
    BLOCK_TEXT: [
        'Verify you are human',
        'Press & Hold',
        'Robot or human'
    ],
    TITLE: 'h1',
    PRICE: [
        'span[itemprop="price"]',
        '[data-testid="price-wrap"] span',
        '.price-characteristic'
    ]
};