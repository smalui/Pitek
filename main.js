document.addEventListener('DOMContentLoaded', function() {

    // 1. FOOTERIN LATAUS (Ajetaan kaikilla sivuilla, joissa on placeholder)
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(error => console.error('Virhe footerin latauksessa:', error));
    }

    // 2. HERO SLIDER (Ajetaan vain sivuilla, joissa on karuselli)
    const track = document.querySelector('.slider-track');
    if (track) {
        let originalSlides = document.querySelectorAll('.slide');
        if (originalSlides.length > 0) {
            const firstClone = originalSlides[0].cloneNode(true);
            const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
            
            track.appendChild(firstClone);
            track.insertBefore(lastClone, originalSlides[0]);
            
            const slides = document.querySelectorAll('.slide');
            const dots = document.querySelectorAll('.dot'); 
            
            let currentIndex = 1;
            let slideInterval;
            let slideWidth = 0;
            let startX = 0;
            let currentTranslate = 0;
            let prevTranslate = 0;
            let isDragging = false;
            let isTransitioning = false;

            function updateDots() {
                if (!dots.length) return;
                dots.forEach(dot => dot.classList.remove('active'));
                let activeDotIndex = currentIndex;
                if (currentIndex === 0) activeDotIndex = originalSlides.length;
                if (currentIndex === originalSlides.length + 1) activeDotIndex = 1;
                dots[activeDotIndex - 1].classList.add('active');
            }

            function updateSliderPosition(instant = false) {
                if (instant) track.classList.add('dragging');
                else track.classList.remove('dragging');
                track.style.transform = `translateX(${currentTranslate}px)`;
            }

            function setPositionByIndex(instant = false) {
                if (slides[0].clientWidth > 0) {
                    slideWidth = slides[0].clientWidth;
                    currentTranslate = currentIndex * -slideWidth;
                    prevTranslate = currentTranslate;
                    updateSliderPosition(instant);
                    updateDots(); 
                } else {
                    setTimeout(() => setPositionByIndex(instant), 100);
                }
            }

            track.addEventListener('transitionend', () => {
                isTransitioning = false;
                if (currentIndex === slides.length - 1) {
                    currentIndex = 1;
                    setPositionByIndex(true);
                }
                if (currentIndex === 0) {
                    currentIndex = slides.length - 2;
                    setPositionByIndex(true);
                }
            });

            function showSlide(index) {
                if (isTransitioning) return;
                isTransitioning = true;
                currentIndex = index;
                setPositionByIndex(false);
            }

            function nextSlide() { showSlide(currentIndex + 1); resetInterval(); }
            function prevSlide() { showSlide(currentIndex - 1); resetInterval(); }

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index + 1); 
                    resetInterval();
                });
            });

            track.addEventListener('touchstart', touchStart);
            track.addEventListener('touchmove', touchMove);
            track.addEventListener('touchend', touchEnd);
            window.addEventListener('resize', () => setPositionByIndex(true)); 

            function touchStart(event) {
                if (isTransitioning) return;
                startX = event.touches[0].clientX;
                isDragging = true;
                track.classList.add('dragging'); 
                clearInterval(slideInterval); 
            }

            function touchMove(event) {
                if (!isDragging) return;
                const currentPosition = event.touches[0].clientX;
                const deltaX = currentPosition - startX;
                currentTranslate = prevTranslate + deltaX; 
                updateSliderPosition(true);
            }

            function touchEnd(event) {
                if (!isDragging) return;
                isDragging = false;
                const movedBy = event.changedTouches[0].clientX - startX;
                if (movedBy < -70) { currentIndex += 1; isTransitioning = true; } 
                else if (movedBy > 70) { currentIndex -= 1; isTransitioning = true; }
                setPositionByIndex(false);
                startInterval(); 
            }

            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            if (prevBtn) prevBtn.addEventListener('click', prevSlide);
            if (nextBtn) nextBtn.addEventListener('click', nextSlide);

            function startInterval() { 
                clearInterval(slideInterval); 
                slideInterval = setInterval(nextSlide, 7000); 
            }
            function resetInterval() { clearInterval(slideInterval); startInterval(); }

            setPositionByIndex(true);
            startInterval();
            window.addEventListener('load', () => setPositionByIndex(true));
        }
    }

    // 3. KARTTA (Ajetaan vain jos sivulla on id="map")
    const mapElement = document.getElementById('map');
    if (mapElement) {
        var pitekLat = 62.295245;
        var pitekLng = 25.8116;
        var map = L.map('map').setView([pitekLat, pitekLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19
        }).addTo(map);

        var customIcon = L.icon({
            iconUrl: 'meisseli.webp',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });

        L.marker([pitekLat, pitekLng], {icon: customIcon}).addTo(map);
    }

    // 4. HEADERIN LATAUS JA RULLAUSANIMAATIO
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                // 1. Laitetaan koodi paikalleen
                headerPlaceholder.innerHTML = data;
                
                // 2. Käynnistetään rullausominaisuus vasta kun palkki on olemassa
                const navbar = document.querySelector('.navbar-white');
                if (navbar) {
                    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    let currentTranslateY = 0; 

                    window.addEventListener('scroll', function() {
                        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        let navbarHeight = navbar.offsetHeight; 
                        
                        let scrollDelta = scrollTop - lastScrollTop;
                        currentTranslateY -= scrollDelta;
                        
                        if (currentTranslateY > 0) {
                            currentTranslateY = 0;
                        } else if (currentTranslateY < -navbarHeight) {
                            currentTranslateY = -navbarHeight;
                        }

                        navbar.style.transform = `translateY(${currentTranslateY}px)`;
                        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
                    });
                }
            })
            .catch(error => console.error('Virhe headerin latauksessa:', error));
    }

  // 5. RULLAAVA TAUSTA (Auto ja pylväät)
    const truck = document.querySelector('.scrolling-truck');
    const pylons = document.querySelectorAll('.scrolling-pylon');

    // Ajetaan skripti vain, jos sivulla on rekka TAI pylväitä
    if (truck || pylons.length > 0) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            if (scrollHeight <= 0) return;
            
            const scrollPercent = scrollTop / scrollHeight;
            const windowWidth = window.innerWidth;
            
            // 1. Rekan liike (Vasemmalta oikealle)
            if (truck) {
                const truckWidth = truck.clientWidth || 800;
                const maxMoveTruck = windowWidth + truckWidth + 800; 
                const moveX = scrollPercent * maxMoveTruck;
                truck.style.transform = `translateX(${moveX}px)`;
            }

            // 2. Pylväiden liike (Oikealta vasemmalle)
            if (pylons.length > 0) {
                pylons.forEach(pylon => {
                    const pylonWidth = pylon.clientWidth || 200;
                    const maxMovePylon = windowWidth + pylonWidth + 800;
                    const moveXPylon = -(scrollPercent * maxMovePylon); 
                    
                    // Jos kyseessä on etummainen pylväs, käännetään se peilikuvaksi (scaleX(-1))
                    if (pylon.classList.contains('front-pylon')) {
                        pylon.style.transform = `translateX(${moveXPylon}px) scaleX(-1)`;
                    } else {
                        pylon.style.transform = `translateX(${moveXPylon}px)`;
                    }
                });
            }
        });
    }
    // 6. UUTISTEN AVAA/SULJE -LOGIIKKA (Ajetaan vain sivuilla joissa on uutisia)
    const newsButtons = document.querySelectorAll('.news-toggle-btn');
    if (newsButtons.length > 0) {
        newsButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.news-card');
                const excerpt = card.querySelector('.news-excerpt');
                const fullText = card.querySelector('.news-full');

                if (fullText.style.display === 'none' || fullText.style.display === '') {
                    fullText.style.display = 'block';
                    excerpt.style.display = 'none';
                    card.classList.add('open'); 
                    this.textContent = 'Piilota teksti';
                    this.style.backgroundColor = '#5f6368';
                } else {
                    fullText.style.display = 'none';
                    excerpt.style.display = 'block';
                    card.classList.remove('open'); 
                    this.textContent = 'Lue koko uutinen';
                    this.style.backgroundColor = '#1a73e8';
                }
            });
        });
    }
});