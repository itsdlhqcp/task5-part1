document.addEventListener('DOMContentLoaded', function() {
    // Original gallery functionality
    const thumbnails = document.querySelectorAll('.thumbnail');
    const imgContainers = document.querySelectorAll('.img-container');
    const thumbnailSidebar = document.querySelector('.thumbnail-sidebar');
    const galleryContainer = document.querySelector('.gallery-container');
    const imagePositions = {};
    let isScrollingProgrammatically = false;
  
    function isGalleryInViewport() {
      const galleryRect = galleryContainer.getBoundingClientRect();
      const carouselSection = document.querySelector('.carousel-section');
      const carouselRect = carouselSection.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      if (carouselRect.top <= windowHeight && carouselRect.bottom >= 0) {
        return false;
      }
      
      if (galleryRect.top > windowHeight * 0.5) {
        return false;
      }
      
      if (galleryRect.bottom < 0) {
        return false;
      }
      
      return galleryRect.bottom > windowHeight * 0.1;
    }
  
    function toggleSidebarVisibility() {
      if (isGalleryInViewport()) {
        thumbnailSidebar.classList.remove('hidden');
      } else {
        thumbnailSidebar.classList.add('hidden');
      }
    }
  
    function scrollToImage(targetId) {
      isScrollingProgrammatically = true;
      
      imgContainers.forEach(container => {
        container.style.display = 'block';
      });
      
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetTop = rect.top + scrollTop;
        
        let offset;
        if (window.innerWidth < 768) {
          offset = 230;
        } else if (window.innerWidth < 1024) {
          offset = 100;
        } else {
          offset = 90;
        }
        
        window.scrollTo({
          top: targetTop - offset,
          behavior: 'smooth'
        });
        
        setTimeout(() => {
          isScrollingProgrammatically = false;
        }, 1000);
      }
      
      updateActiveThumbnail(targetId);
    }
    
    function updateActiveThumbnail(targetId) {
      thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.getAttribute('data-target') === targetId) {
          thumb.classList.add('active');
        }
      });
      
      imgContainers.forEach(container => {
        container.classList.remove('active-image');
        if (container.id === targetId) {
          container.classList.add('active-image');
        }
      });
    }
    
    function calculateImagePositions() {
      imgContainers.forEach(container => {
        const rect = container.getBoundingClientRect();
        imagePositions[container.id] = {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY
        };
      });
    }
    
    function handleScroll() {
      toggleSidebarVisibility();
      
      if (isScrollingProgrammatically) {
        return;
      }
      
      const scrollPosition = window.scrollY + window.innerHeight * 0.7;
      
      let currentImageId = null;
      let closestDistance = Infinity;
      
      for (const id in imagePositions) {
        const pos = imagePositions[id];
        const middle = (pos.top + pos.bottom) / 2;
        const distance = Math.abs(scrollPosition - middle);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          currentImageId = id;
        }
      }
      
      if (currentImageId) {
        updateActiveThumbnail(currentImageId);
      }
      
      checkElementsInViewport();
    }
    
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
      );
    }
    
    function checkElementsInViewport() {
      imgContainers.forEach(container => {
        if (isElementInViewport(container) && !container.classList.contains('in-view')) {
          container.classList.add('in-view');
        }
      });
    }
    
    function setupAnimations() {
      imgContainers.forEach((container, index) => {
        container.classList.remove('animate-from-left', 'animate-from-right', 'animate-from-top', 'animate-from-bottom', 'in-view');
        
        if (index % 3 === 0) {
          container.classList.add('animate-from-left');
        } else if (index % 3 === 1) {
          container.classList.add('animate-from-right');
        } else {
          container.classList.add(index % 2 === 0 ? 'animate-from-top' : 'animate-from-bottom');
        }
        
        if (index % 3 === 0) {
          container.style.zIndex = '3';
        } else if (index % 3 === 1) {
          container.style.zIndex = '2';
        } else {
          container.style.zIndex = '1';
        }
      });
      
      void document.documentElement.offsetHeight;
      setTimeout(checkElementsInViewport, 100);
    }
    
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetId = this.getAttribute('data-target');
        setupAnimations();
        
        setTimeout(() => {
          scrollToImage(targetId);
        }, 100);
      });
    });
    
    imgContainers.forEach(container => {
      container.addEventListener('mouseenter', function() {
        this.style.zIndex = '20';
      });
      
      container.addEventListener('mouseleave', function() {
        const index = Array.from(imgContainers).indexOf(this);
        if (index % 3 === 0) {
          this.style.zIndex = '3';
        } else if (index % 3 === 1) {
          this.style.zIndex = '2';
        } else {
          this.style.zIndex = '1';
        }
      });
    });
    
    imgContainers.forEach(container => {
      container.style.display = 'block';
    });
    
    updateActiveThumbnail('img3');
    
    function animateImagesOnLoad() {
      setupAnimations();
      calculateImagePositions();
      
      setTimeout(() => {
        checkElementsInViewport();
      }, 300);
    }
    
    window.addEventListener('load', function() {
      animateImagesOnLoad();
      toggleSidebarVisibility();
      window.addEventListener('scroll', handleScroll);
    });
    
    window.addEventListener('resize', function() {
      calculateImagePositions();
      toggleSidebarVisibility();
      
      const width = window.innerWidth;
      if (Math.abs(lastWidth - width) > 200) {
        setupAnimations();
        lastWidth = width;
      }
    });
    
    let lastWidth = window.innerWidth;
    setupAnimations();
    setTimeout(checkElementsInViewport, 500);
    setTimeout(toggleSidebarVisibility, 100);

    // 3D Carousel functionality
    let xPos = 0;

    gsap.timeline()
        .set('.ring', { rotationY: 180, cursor: 'grab' })
        .set('.img', {
            rotateY: (i) => i * -36,
            transformOrigin: '50% 50% 500px',
            z: -500,
            backgroundImage: (i) => 'url(' + getImageUrl(i) + ')',
            backgroundPosition: (i) => getBgPos(i),
            backfaceVisibility: 'hidden'
        })
        .from('.img', {
            duration: 1.5,
            y: 200,
            opacity: 0,
            stagger: 0.1,
            ease: 'expo'
        })
        .add(() => {
            document.querySelectorAll('.img').forEach(img => {
                img.addEventListener('mouseenter', (e) => {
                    let current = e.currentTarget;
                    gsap.to('.img', { opacity: (i, t) => (t == current) ? 1 : 0.5, ease: 'power3' })
                });

                img.addEventListener('mouseleave', (e) => {
                    gsap.to('.img', { opacity: 1, ease: 'power2.inOut' })
                });
            });
        }, '-=0.5');

    document.addEventListener('mousedown', dragStart);
    document.addEventListener('touchstart', dragStart);

    function dragStart(e) {
        if (e.touches) e.clientX = e.touches[0].clientX;
        xPos = Math.round(e.clientX);
        gsap.set('.ring', { cursor: 'grabbing' });
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
    }

    function drag(e) {
        if (e.touches) e.clientX = e.touches[0].clientX;
        gsap.to('.ring', {
            rotationY: '-=' + ((Math.round(e.clientX) - xPos) % 360),
            onUpdate: () => { gsap.set('.img', { backgroundPosition: (i) => getBgPos(i) }) }
        });

        xPos = Math.round(e.clientX);
    }

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    function dragEnd(e) {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        gsap.set('.ring', { cursor: 'grab' });
    }

    function getBgPos(i) {
        return (100 - gsap.utils.wrap(0, 360, gsap.getProperty('.ring', 'rotationY') - 180 - i * 36) / 360 * 500) + 'px 0px';
    }

    function getImageUrl(i) {
        const imageUrls = [
        'https://picsum.photos/id/42/600/400/',
        'https://picsum.photos/id/43/600/400/',
        'https://picsum.photos/id/44/600/400/',
        'https://picsum.photos/id/45/600/400/',
        'https://picsum.photos/id/46/600/400/',
        'https://picsum.photos/id/47/600/400/',
        'https://picsum.photos/id/48/600/400/',
        'https://picsum.photos/id/49/600/400/',
        'https://picsum.photos/id/50/600/400/',
        'https://picsum.photos/id/51/600/400/'
        ];
        return imageUrls[i];
    }
});