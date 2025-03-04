window.onload=prepareExif;

function prepareExif() {
    var imgs = document.getElementsByClassName("album-img");
    for (let img of imgs) {
        img.onload = function () {
            var p = document.createElement("p");
            p.style.fontStyle = "italic";
            p.innerHTML = "Loading EXIF data...";
            this.parentNode.insertBefore(p, this.nextSibling);
            EXIF.getData(this, function () {
                var md = EXIF.getAllTags(this);
                if (md == null || md == undefined) {
                    p.innerHTML = "EXIF data not available.";
                } else {
                    var exp_time = `${md.ExposureTime.numerator}/${md.ExposureTime.denominator}`
                    if (md.ExposureTime.denominator == 1) {
                        exp_time = `${md.ExposureTime.numerator}`;
                    }
                    p.innerHTML = `Shot with ${md.LensModel}, at ${md.FocalLengthIn35mmFilm}mm (35mm equiv.), f/${md.FNumber}, ${exp_time}s, ISO ${md.ISOSpeedRatings}`;
                }
            });
            if (this.alt != null && this.alt != undefined && this.alt != "") {
                var desc = document.createElement("p");
                desc.style.color = "#000";
                desc.style.fontWeight = "bold";
                desc.innerHTML = this.alt;
                this.parentNode.insertBefore(desc, p.nextSibling);
            }
            var hr = document.createElement("hr");
            this.parentNode.insertBefore(hr, desc.nextSibling);
        }
        if (img.complete) {
            img.onload();
        }
    }
}