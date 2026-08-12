/* Email hover box.
 *
 * The address is deliberately not a mailto link and never appears verbatim in
 * the markup — index.ejs spells "@" and "." out as " at " / " dot " and then
 * base64-encodes the result. This decodes that for display; what it renders is
 * still the spelled-out form, so a scraper running the page's JavaScript gains
 * nothing over one reading the source.
 *
 * Hover and keyboard focus reveal it. Click toggles it too, because a hover
 * box is unreachable on a touch screen.
 */
(function () {
    var item = document.querySelector('.email-item');
    if (!item) return;

    var button = item.querySelector('.email-reveal');
    var box = item.querySelector('.email-box');
    if (!button || !box) return;

    var revealed = false;

    function reveal() {
        if (revealed) return;
        var packed = button.getAttribute('data-e');
        if (!packed) return;
        try {
            // Decoded before first paint of the box, so aria-describedby has
            // something to announce when the button takes focus.
            box.textContent = atob(packed);
            revealed = true;
        } catch (err) {
            box.textContent = 'see CV';
            revealed = true;
        }
    }

    function setOpen(open) {
        item.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
    }

    button.addEventListener('mouseenter', reveal);
    button.addEventListener('focus', reveal);

    button.addEventListener('click', function () {
        reveal();
        setOpen(!item.classList.contains('is-open'));
    });

    // Tapping elsewhere dismisses the box on touch devices.
    document.addEventListener('click', function (e) {
        if (!item.contains(e.target)) setOpen(false);
    });

    button.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });
})();
