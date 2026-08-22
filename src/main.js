import './styles.css';
import * as THREE from 'three';
import gsap from 'gsap';

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xf3dfc5, 0.035);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0.35, 6.2);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const ambientLight = new THREE.AmbientLight(0xfff3df, 1.45);
scene.add(ambientLight);

const keyLight = new THREE.PointLight(0xffd4a8, 24, 20);
keyLight.position.set(-3.5, 2.5, 4);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x8ea780, 18, 20);
rimLight.position.set(3.5, -1.5, 2.5);
scene.add(rimLight);

const group = new THREE.Group();
scene.add(group);

const coreGeometry = new THREE.TorusKnotGeometry(1.08, 0.32, 240, 28);
const coreMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf6d7b6,
  metalness: 0.12,
  roughness: 0.28,
  transmission: 0.24,
  thickness: 1.2,
  clearcoat: 0.86,
  clearcoatRoughness: 0.18,
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
group.add(core);

const wire = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.36, 0.012, 180, 8),
  new THREE.MeshBasicMaterial({
    color: 0x6f5a4b,
    wireframe: true,
    transparent: true,
    opacity: 0.16,
  }),
);
group.add(wire);

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xb96945,
  transparent: true,
  opacity: 0.32,
  side: THREE.DoubleSide,
});

for (let index = 0; index < 3; index += 1) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1 + index * 0.28, 0.008, 16, 180), ringMaterial);
  ring.rotation.x = Math.PI / 2 + index * 0.34;
  ring.rotation.y = index * 0.72;
  group.add(ring);
}

const pearlGroup = new THREE.Group();
const pearlGeometry = new THREE.SphereGeometry(0.075, 24, 24);
const pearlMaterials = [
  new THREE.MeshPhysicalMaterial({ color: 0xfff8ed, roughness: 0.2, clearcoat: 0.8 }),
  new THREE.MeshPhysicalMaterial({ color: 0xd9aa85, roughness: 0.34, clearcoat: 0.56 }),
  new THREE.MeshPhysicalMaterial({ color: 0x8ea780, roughness: 0.38, clearcoat: 0.42 }),
];

for (let index = 0; index < 18; index += 1) {
  const angle = (index / 18) * Math.PI * 2;
  const radius = 2.05 + Math.sin(index * 1.8) * 0.22;
  const pearl = new THREE.Mesh(pearlGeometry, pearlMaterials[index % pearlMaterials.length]);
  pearl.position.set(Math.cos(angle) * radius, Math.sin(index * 0.74) * 1.1, Math.sin(angle) * radius);
  pearl.scale.setScalar(0.72 + (index % 4) * 0.12);
  pearlGroup.add(pearl);
}

group.add(pearlGroup);

const streamGroup = new THREE.Group();
group.add(streamGroup);

for (let streamIndex = 0; streamIndex < 7; streamIndex += 1) {
  const points = [];

  for (let pointIndex = 0; pointIndex < 90; pointIndex += 1) {
    const progress = pointIndex / 89;
    const angle = progress * Math.PI * 2 + streamIndex * 0.92;
    const radius = 2.28 + Math.sin(progress * Math.PI * 4 + streamIndex) * 0.16;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        (progress - 0.5) * 3.1,
        Math.sin(angle) * radius,
      ),
    );
  }

  const stream = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color: streamIndex % 2 === 0 ? 0xb96945 : 0x8ea780,
      transparent: true,
      opacity: 0.18,
    }),
  );
  stream.rotation.x = streamIndex * 0.18;
  stream.rotation.y = streamIndex * 0.26;
  streamGroup.add(stream);
}

const particleCount = 900;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const palette = [
  new THREE.Color(0xb96945),
  new THREE.Color(0xffe7ca),
  new THREE.Color(0x8ea780),
];

for (let index = 0; index < particleCount; index += 1) {
  const radius = 4.3 + Math.random() * 5.8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[index * 3 + 2] = radius * Math.cos(phi);

  const color = palette[index % palette.length];
  colors[index * 3] = color.r;
  colors[index * 3 + 1] = color.g;
  colors[index * 3 + 2] = color.b;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  }),
);
scene.add(particles);

const pointer = new THREE.Vector2();
const targetRotation = new THREE.Vector2();
window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / sizes.width - 0.5) * 2;
  pointer.y = (event.clientY / sizes.height - 0.5) * 2;
  targetRotation.x = pointer.y * 0.25;
  targetRotation.y = pointer.x * 0.38;
});

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();
const animate = () => {
  const elapsed = clock.getElapsedTime();
  core.rotation.x = elapsed * 0.22;
  core.rotation.y = elapsed * 0.32;
  wire.rotation.x = -elapsed * 0.18;
  wire.rotation.z = elapsed * 0.2;
  pearlGroup.rotation.y = elapsed * 0.18;
  pearlGroup.rotation.x = Math.sin(elapsed * 0.42) * 0.16;
  streamGroup.rotation.y = -elapsed * 0.08;
  streamGroup.rotation.z = Math.sin(elapsed * 0.34) * 0.16;
  particles.rotation.y = elapsed * 0.025;
  particles.rotation.x = Math.sin(elapsed * 0.2) * 0.08;

  group.rotation.x += (targetRotation.x - group.rotation.x) * 0.04;
  group.rotation.y += (targetRotation.y - group.rotation.y) * 0.04;
  group.position.y = Math.sin(elapsed * 0.8) * 0.12;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
animate();

gsap.to(core.scale, {
  x: 1.08,
  y: 1.08,
  z: 1.08,
  duration: 3.4,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
});

gsap.to(pearlGroup.rotation, {
  z: Math.PI * 2,
  duration: 22,
  ease: 'none',
  repeat: -1,
});

gsap.fromTo(
  '[data-animate]',
  { y: 34, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.08,
    ease: 'power3.out',
  },
);

gsap.to('.hero-stack span', {
  y: -6,
  duration: 2.4,
  ease: 'sine.inOut',
  stagger: 0.18,
  repeat: -1,
  yoyo: true,
});

gsap.to('.profile-card, .contact-form', {
  y: -8,
  duration: 3.6,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
  stagger: 0.28,
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.18 },
);

document.querySelectorAll('[data-animate]').forEach((element) => observer.observe(element));

const scrollProgress = document.querySelector('[data-scroll-progress]');

const updateScrollProgress = () => {
  if (!scrollProgress) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
};

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

const getHeaderOffset = () => {
  const header = document.querySelector('.site-header');
  return header ? header.offsetHeight + 28 : 0;
};

const scrollToHash = (hash, behavior = 'smooth') => {
  const target = document.querySelector(hash);

  if (!target) {
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({ top: Math.max(top, 0), behavior });
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');

    if (!hash || hash === '#') {
      return;
    }

    event.preventDefault();
    history.pushState(null, '', hash);
    scrollToHash(hash);
  });
});

window.addEventListener('load', () => {
  if (window.location.hash) {
    requestAnimationFrame(() => scrollToHash(window.location.hash, 'auto'));
    setTimeout(() => scrollToHash(window.location.hash, 'auto'), 260);
  }
});

window.addEventListener('hashchange', () => {
  if (window.location.hash) {
    scrollToHash(window.location.hash);
  }
});

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
  });
};

const navObserver = new IntersectionObserver(
  (entries) => {
    const activeEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (activeEntry) {
      setActiveNav(activeEntry.target.id);
    }
  },
  {
    rootMargin: '-35% 0px -50% 0px',
    threshold: [0.08, 0.22, 0.4],
  },
);

sections.forEach((section) => navObserver.observe(section));

document
  .querySelectorAll('.project-card, .profile-card, .contact-form, .timeline-item, .skill-row, .hero-panel > div, .profile-details div')
  .forEach((surface) => {
    surface.addEventListener('pointermove', (event) => {
      const rect = surface.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      surface.style.setProperty('--mx', `${x}%`);
      surface.style.setProperty('--my', `${y}%`);
    });
  });

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
});

const profileImage = document.querySelector('[data-profile-image]');
const profileStatus = document.querySelector('[data-profile-status]');

const setProfileStatus = (message) => {
  if (profileStatus) {
    profileStatus.textContent = message;
  }
};

const setProfileImage = (imageData) => {
  if (!profileImage) {
    return;
  }

  if (imageData) {
    profileImage.src = imageData;
    return;
  }

  profileImage.removeAttribute('src');
};

const resizeProfileImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('error', () => reject(new Error('Unable to read the selected image.')));
    reader.addEventListener('load', () => {
      const image = new Image();

      image.addEventListener('error', () => reject(new Error('Unable to load the selected image.')));
      image.addEventListener('load', () => {
        const maxSize = 900;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const outputCanvas = document.createElement('canvas');
        const context = outputCanvas.getContext('2d');

        outputCanvas.width = Math.round(image.width * scale);
        outputCanvas.height = Math.round(image.height * scale);
        context.drawImage(image, 0, 0, outputCanvas.width, outputCanvas.height);
        resolve(outputCanvas.toDataURL('image/jpeg', 0.86));
      });

      image.src = String(reader.result);
    });

    reader.readAsDataURL(file);
  });

try {
  setProfileImage(localStorage.getItem(profileStorageKey));
} catch {
  setProfileStatus('Profile photo storage is unavailable in this browser.');
}

profileInput?.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    setProfileStatus('Please select an image file.');
    profileInput.value = '';
    return;
  }

  try {
    const imageData = await resizeProfileImage(file);
    setProfileImage(imageData);

    try {
      localStorage.setItem(profileStorageKey, imageData);
      setProfileStatus('Profile picture updated.');
    } catch {
      setProfileStatus('Profile picture updated for this session.');
    }
  } catch {
    setProfileStatus('That image could not be loaded.');
  }
});

profileReset?.addEventListener('click', () => {
  setProfileImage(null);

  if (profileInput) {
    profileInput.value = '';
  }

  try {
    localStorage.removeItem(profileStorageKey);
  } catch {
    // Storage can fail in private or restricted browser modes.
  }

  setProfileStatus('Profile picture reset.');
});

const contactForm = document.querySelector('[data-contact-form]');

contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const formData = new FormData(contactForm);
    const status = contactForm.querySelector('[data-form-status]');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (status) {
        status.textContent = 'Sending your details...';
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
    }

    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json'
            }
        });

        if (response.ok) {
            const name = String(formData.get('name')).trim();

            if (status) {
                status.textContent = `Thanks, ${name}! Your message has been sent successfully.`;
            }

            contactForm.reset();
        } else {
            const data = await response.json();

            if (status) {
                status.textContent =
                    data?.errors?.map(error => error.message).join(', ') ||
                    'Something went wrong. Please try again.';
            }
        }
    } catch (error) {
        if (status) {
            status.textContent =
                'Unable to send your message right now. Please try again later.';
        }
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Details';
        }
    }
});