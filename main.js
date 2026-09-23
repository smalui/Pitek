document.addEventListener('DOMContentLoaded', function() {

    // 1. FOOTERIN LATAUS (Ajetaan kaikilla sivuilla, joissa on placeholder)
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;

                // Selain yrittää käsitellä ankkurin ennen kuin footer on ladattu.
                if (window.location.hash === '#yhteystiedot') {
                    const scrollToContacts = () => {
                        document.getElementById('yhteystiedot')?.scrollIntoView({ block: 'start' });
                    };
                    requestAnimationFrame(() => requestAnimationFrame(scrollToContacts));
                    setTimeout(scrollToContacts, 100);
                }
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

            [firstClone, lastClone].forEach(clone => {
                clone.querySelectorAll('h1, h2').forEach(heading => {
                    const visualHeading = document.createElement('div');
                    visualHeading.className = 'clone-heading';
                    visualHeading.innerHTML = heading.innerHTML;
                    heading.replaceWith(visualHeading);
                });
            });

            firstClone.setAttribute('aria-hidden', 'true');
            lastClone.setAttribute('aria-hidden', 'true');
            
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
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            track.setAttribute('aria-live', 'off');

            function updateDots() {
                if (!dots.length) return;
                dots.forEach(dot => {
                    dot.classList.remove('active');
                    dot.removeAttribute('aria-current');
                });
                let activeDotIndex = currentIndex;
                if (currentIndex === 0) activeDotIndex = originalSlides.length;
                if (currentIndex === originalSlides.length + 1) activeDotIndex = 1;
                dots[activeDotIndex - 1].classList.add('active');
                dots[activeDotIndex - 1].setAttribute('aria-current', 'true');
            }

            function updateSlideAccessibility() {
                let activeSlideIndex = currentIndex - 1;
                if (currentIndex === 0) activeSlideIndex = originalSlides.length - 1;
                if (currentIndex === originalSlides.length + 1) activeSlideIndex = 0;

                originalSlides.forEach((slide, index) => {
                    slide.setAttribute('aria-hidden', index === activeSlideIndex ? 'false' : 'true');
                });
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
                    updateSlideAccessibility();
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

                if (reducedMotion) {
                    if (index === 0) index = slides.length - 2;
                    if (index === slides.length - 1) index = 1;
                    currentIndex = index;
                    setPositionByIndex(true);
                    return;
                }

                isTransitioning = true;
                currentIndex = index;
                setPositionByIndex(false);
            }

            function nextSlide() { showSlide(currentIndex + 1); }
            function prevSlide() { showSlide(currentIndex - 1); }

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
                if (movedBy < -70) showSlide(currentIndex + 1);
                else if (movedBy > 70) showSlide(currentIndex - 1);
                else setPositionByIndex(reducedMotion);
                startInterval(); 
            }

            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
            if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });


            function startInterval() { 
                clearInterval(slideInterval);
                // Pyörii automaattisesti 7 sekunnin välein, jos välilehti on auki 
                // ja käyttäjä ei ole estänyt animaatioita (reducedMotion)
                if (!reducedMotion && !document.hidden) {
                    slideInterval = setInterval(nextSlide, 7000);
                }
            }

            function resetInterval() { clearInterval(slideInterval); startInterval(); }

            document.addEventListener('visibilitychange', startInterval);

            setPositionByIndex(true);
            startInterval();
            window.addEventListener('load', () => setPositionByIndex(true));
        }
    }

// 3. KARTTA (Ajetaan vain jos sivulla on id="map")
    const mapElement = document.getElementById('map');
    if (mapElement && typeof L !== 'undefined') {
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

        // Pakotetaan kartta päivittämään kokonsa hieman myöhemmin
        setTimeout(function() {
            map.invalidateSize();
        }, 500);
    }
    

    // 4. HEADERIN LATAUS JA RULLAUSANIMAATIO
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(data => {
                // 1. Laitetaan koodi paikalleen
                headerPlaceholder.innerHTML = data;

                const navToggle = document.querySelector('.nav-toggle');
                const navigation = document.querySelector('.nav-links-right');
                const dropdown = document.querySelector('.dropdown');
                const dropdownButton = document.querySelector('.dropbtn');

                if (navToggle && navigation) {
                    navToggle.addEventListener('click', () => {
                        const isOpen = navigation.classList.toggle('is-open');
                        navToggle.setAttribute('aria-expanded', String(isOpen));
                        navToggle.querySelector('.sr-only').textContent = isOpen ? 'Sulje päävalikko' : 'Avaa päävalikko';
                    });
                }

                if (dropdown && dropdownButton) {
                    dropdownButton.addEventListener('click', () => {
                        const isOpen = dropdown.classList.toggle('is-open');
                        dropdownButton.setAttribute('aria-expanded', String(isOpen));
                    });

                    dropdown.addEventListener('keydown', event => {
                        if (event.key === 'Escape') {
                            dropdown.classList.remove('is-open');
                            dropdownButton.setAttribute('aria-expanded', 'false');
                            dropdownButton.focus();
                        }
                    });
                }
                
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
                    }, { passive: true });
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
        }, { passive: true });
    }
    // 6. UUTISTEN AVAA/SULJE -LOGIIKKA (Ajetaan vain sivuilla joissa on uutisia)
    const newsButtons = document.querySelectorAll('.news-toggle-btn');
    if (newsButtons.length > 0) {
        newsButtons.forEach(btn => {
            const card = btn.closest('.news-card');
            const excerpt = card.querySelector('.news-excerpt');
            const fullText = card.querySelector('.news-full');
            fullText.hidden = true;
            btn.setAttribute('aria-expanded', 'false');

            btn.addEventListener('click', function() {
                const isOpen = fullText.hidden;
                if (isOpen) {
                    fullText.hidden = false;
                    excerpt.hidden = true;
                    card.classList.add('open'); 
                    this.textContent = 'Piilota teksti';
                    this.setAttribute('aria-expanded', 'true');
                } else {
                    fullText.hidden = true;
                    excerpt.hidden = false;
                    card.classList.remove('open'); 
                    this.textContent = 'Lue koko uutinen';
                    this.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
});
