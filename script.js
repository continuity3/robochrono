(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionToggle = document.getElementById("motion-toggle");
  const videoWall = document.getElementById("video-wall");
  const videos = new Set();
  const visibleVideos = new WeakMap();
  let motionPaused = reducedMotion.matches;
  let motionOverride = false;
  let galleryPaused = videoWall?.classList.contains("gallery-paused") || false;
  let demoOpen = false;

  function updatePlayback(video) {
    const wallPaused = videoWall?.contains(video) && (galleryPaused || demoOpen);
    if (motionPaused || wallPaused || document.hidden || !visibleVideos.get(video)) {
      video.pause();
      return;
    }
    const playback = video.play();
    if (playback && typeof playback.catch === "function") {
      // Native controls remain available when a browser blocks autoplay.
      playback.catch(() => {});
    }
  }

  const videoObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
          visibleVideos.set(target, isIntersecting && intersectionRatio > 0);
          updatePlayback(target);
        });
      }, { threshold: [0, 0.1] })
    : null;

  function registerVideo(video) {
    if (videos.has(video)) return;
    videos.add(video);
    // Playback is controlled by visibility and the visitor's motion preference.
    video.removeAttribute("autoplay");
    video.muted = true;
    video.playsInline = true;
    if (videoObserver) {
      visibleVideos.set(video, false);
      video.pause();
      videoObserver.observe(video);
    } else {
      // A browser without visibility observation keeps explicit playback controls.
      visibleVideos.set(video, false);
      video.controls = true;
    }
  }

  function unregisterVideo(video) {
    video.pause();
    videoObserver?.unobserve(video);
    videos.delete(video);
    visibleVideos.delete(video);
  }

  function updateMotion() {
    document.body.classList.toggle("motion-paused", motionPaused);
    if (motionToggle) {
      motionToggle.textContent = motionPaused ? "Resume motion" : "Pause motion";
      motionToggle.setAttribute("aria-pressed", String(motionPaused));
    }
    videos.forEach(updatePlayback);
  }

  document.querySelectorAll("video[data-playable], #hero-video").forEach(registerVideo);
  motionToggle?.addEventListener("click", () => {
    motionOverride = true;
    motionPaused = !motionPaused;
    updateMotion();
  });
  const onMotionPreferenceChange = () => {
    if (!motionOverride) {
      motionPaused = reducedMotion.matches;
      updateMotion();
    }
  };
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", onMotionPreferenceChange);
  } else if (reducedMotion.addListener) {
    reducedMotion.addListener(onMotionPreferenceChange);
  }
  document.addEventListener("visibilitychange", () => videos.forEach(updatePlayback));
  updateMotion();

  const embodiments = {
    gim: {
      title: "GIM gripper",
      kind: "Bimanual gripper",
      count: "15",
      description: "Two robot arms coordinate object manipulation, captured through an external camera and two wrist-mounted cameras.",
      cameras: [
        ["Main view", "stack-cubes-gim-main-2x.mp4"],
        ["Left wrist", "stack-cubes-gim-wrist-left-2x.mp4"],
        ["Right wrist", "stack-cubes-gim-wrist-right-2x.mp4"],
      ],
    },
    tianji: {
      title: "Tianji gripper",
      kind: "Gripper manipulation",
      count: "14",
      description: "Teleoperated gripper demonstrations capture the same execution from a top camera and two wrist-mounted cameras.",
      cameras: [
        ["Top view", "stack-cubes-tianji-top-2x.mp4"],
        ["Left wrist", "stack-cubes-tianji-wrist-left-2x.mp4"],
        ["Right wrist", "stack-cubes-tianji-wrist-right-2x.mp4"],
      ],
    },
    ego: {
      title: "Ego hand",
      kind: "Egocentric human demonstration",
      count: "5",
      description: "First-person human demonstrations capture natural hand–object interactions and the progression of everyday manipulation tasks.",
      cameras: [["Egocentric view", "stack-cubes-ego-hand-2x.mp4"]],
    },
    wuji: {
      title: "Dexterous hand",
      kind: "Dexterous robot hand",
      count: "5",
      description: "Multi-finger robotic hands perform fine-grained object manipulation, adding a dexterous-hand embodiment to the benchmark.",
      cameras: [["Dexterous hand view", "stack-cubes-tianji-hand-2x.mp4"]],
    },
  };
  const tabs = [...document.querySelectorAll("button[data-embodiment]")];
  const embodimentPanel = document.getElementById("embodiment-panel");
  const cameraContainer = document.getElementById("embodiment-videos");
  let activeEmbodiment = null;

  function selectEmbodiment(tab, keepInitialVideos = false) {
    const name = tab.dataset.embodiment;
    const embodiment = embodiments[name];
    if (!embodiment || !cameraContainer || name === activeEmbodiment) return;
    activeEmbodiment = name;
    tabs.forEach((button, index) => {
      if (!button.id) button.id = `embodiment-tab-${index}`;
      const selected = button === tab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.classList.toggle("active", selected);
    });
    embodimentPanel?.setAttribute("aria-labelledby", tab.id);
    ["title", "description", "count", "kind"].forEach((key) => {
      const element = document.getElementById(`embodiment-${key}`);
      if (element) element.textContent = embodiment[key];
    });
    cameraContainer.classList.toggle("single-camera", embodiment.cameras.length === 1);
    cameraContainer.classList.add("cameras");
    if (keepInitialVideos && cameraContainer.querySelector("video")) {
      cameraContainer.querySelectorAll("video").forEach(registerVideo);
      return;
    }
    cameraContainer.querySelectorAll("video").forEach(unregisterVideo);
    const cameraViews = embodiment.cameras.map(([label, filename], index) => {
      const camera = document.createElement("div");
      camera.className = `camera ${index === 0 ? "camera-main" : "camera-secondary"}`;
      const cameraLabel = document.createElement("span");
      cameraLabel.className = "camera-label";
      cameraLabel.textContent = label;
      const video = document.createElement("video");
      video.src = `assets/videos/${filename}`;
      video.controls = true;
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.dataset.playable = "";
      video.setAttribute("aria-label", `${embodiment.title}: stack cubes, ${label.toLowerCase()}`);
      camera.append(cameraLabel, video);
      return camera;
    });
    cameraContainer.replaceChildren(...cameraViews);
    cameraContainer.querySelectorAll("video").forEach(registerVideo);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectEmbodiment(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      selectEmbodiment(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });
  if (tabs.length) selectEmbodiment(tabs[0], true);

  const heroVideo = document.getElementById("hero-video");
  const heroProgress = document.getElementById("hero-progress");
  const heroTime = document.getElementById("hero-time");
  function formatTime(seconds) {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }
  function updateHeroTime() {
    if (!heroVideo) return;
    const duration = Number.isFinite(heroVideo.duration) ? heroVideo.duration : 0;
    const progress = duration ? (heroVideo.currentTime / duration) * 100 : 0;
    if (heroProgress) heroProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    if (heroTime) heroTime.textContent = `${formatTime(heroVideo.currentTime)} / ${formatTime(duration)}`;
  }
  ["timeupdate", "loadedmetadata", "durationchange", "emptied"].forEach((eventName) => {
    heroVideo?.addEventListener(eventName, updateHeroTime);
  });
  updateHeroTime();

  const galleryToggle = document.getElementById("gallery-toggle");
  const demoDialog = document.getElementById("demo-dialog");
  const demoVideo = document.getElementById("demo-video");
  const demoTitle = document.getElementById("demo-title");
  const demoKind = document.getElementById("demo-kind");
  const demoSource = document.getElementById("demo-source");
  const originalCards = new WeakMap();
  let demoTrigger = null;
  let demoPreviousOverflow = "";

  function updateGalleryMotion() {
    videoWall?.classList.toggle("gallery-paused", galleryPaused || demoOpen);
    if (galleryToggle) {
      galleryToggle.textContent = galleryPaused ? "Resume video wall" : "Pause video wall";
      galleryToggle.setAttribute("aria-pressed", String(galleryPaused));
    }
    videoWall?.querySelectorAll("video[data-playable]").forEach(updatePlayback);
  }

  videoWall?.querySelectorAll(".film-track").forEach((track) => {
    const group = track.querySelector(".film-group");
    if (!group || track.querySelector("[data-gallery-clone]")) return;
    const clone = group.cloneNode(true);
    clone.dataset.galleryClone = "";
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    const buttons = [...group.querySelectorAll("button[data-demo]")];
    clone.querySelectorAll("button[data-demo]").forEach((button, index) => {
      button.tabIndex = -1;
      originalCards.set(button, buttons[index]);
    });
    track.append(clone);
    track.classList.add("gallery-ready");
    clone.querySelectorAll("video[data-playable]").forEach(registerVideo);
  });
  galleryToggle?.addEventListener("click", () => {
    galleryPaused = !galleryPaused;
    updateGalleryMotion();
  });
  updateGalleryMotion();

  // Duplicates complete the visual loop; their original cards own keyboard focus.
  videoWall?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-gallery-clone] button[data-demo]")) event.preventDefault();
  });
  videoWall?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-demo]");
    if (!button || !videoWall.contains(button) || !demoDialog || !demoVideo || typeof demoDialog.showModal !== "function") return;
    if (!button.dataset.demo) return;
    demoTrigger = originalCards.get(button) || button;
    demoPreviousOverflow = document.body.style.overflow;
    const title = button.dataset.title || "RoboChrono demonstration";
    if (demoTitle) demoTitle.textContent = title;
    if (demoKind) demoKind.textContent = button.dataset.kind || "";
    if (demoSource) {
      demoSource.hidden = !button.dataset.source;
      if (button.dataset.source) demoSource.href = button.dataset.source;
      else demoSource.removeAttribute("href");
    }
    demoVideo.src = button.dataset.demo;
    demoVideo.muted = true;
    demoVideo.controls = true;
    demoVideo.playsInline = true;
    demoVideo.setAttribute("aria-label", title);
    demoOpen = true;
    updateGalleryMotion();
    demoDialog.showModal();
    document.body.style.overflow = "hidden";
    // Opening a demonstration is an explicit playback request, including with reduced motion.
    const playback = demoVideo.play();
    if (playback && typeof playback.catch === "function") playback.catch(() => {});
  });
  document.getElementById("demo-close")?.addEventListener("click", () => demoDialog?.close());
  demoDialog?.addEventListener("click", (event) => {
    if (event.target !== demoDialog) return;
    const bounds = demoDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      demoDialog.close();
    }
  });
  demoDialog?.addEventListener("close", () => {
    if (demoVideo) {
      demoVideo.pause();
      demoVideo.removeAttribute("src");
      demoVideo.load();
    }
    document.body.style.overflow = demoPreviousOverflow;
    demoOpen = false;
    updateGalleryMotion();
    demoTrigger?.focus({ preventScroll: true });
  });

  const figureDialog = document.getElementById("figure-dialog");
  const fullFigure = document.getElementById("figure-full");
  const figureCaption = document.getElementById("figure-caption");
  let figureTrigger = null;
  let previousOverflow = "";
  document.querySelectorAll("button[data-figure]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!figureDialog || !fullFigure || typeof figureDialog.showModal !== "function") return;
      fullFigure.src = button.dataset.figure;
      fullFigure.alt = button.dataset.caption || button.querySelector("img")?.alt || "Research figure";
      if (figureCaption) figureCaption.textContent = button.dataset.caption || fullFigure.alt;
      figureTrigger = button;
      previousOverflow = document.body.style.overflow;
      figureDialog.showModal();
      document.body.style.overflow = "hidden";
    });
  });
  document.getElementById("figure-close")?.addEventListener("click", () => figureDialog?.close());
  figureDialog?.addEventListener("click", (event) => {
    if (event.target !== figureDialog) return;
    const bounds = figureDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      figureDialog.close();
    }
  });
  figureDialog?.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    figureTrigger?.focus({ preventScroll: true });
  });

  const copyCitation = document.getElementById("copy-citation");
  const bibtex = document.getElementById("bibtex");
  const copyStatus = document.getElementById("copy-status");
  copyCitation?.addEventListener("click", async () => {
    if (!bibtex) return;
    const citation = bibtex.textContent.trim();
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(citation);
        copied = true;
      }
    } catch (_) {
      // Fall through to selection, which also supports manual copying.
    }
    if (!copied) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(bibtex);
        selection.removeAllRanges();
        selection.addRange(range);
        try {
          copied = document.execCommand("copy");
        } catch (_) {
          copied = false;
        }
        if (copied) selection.removeAllRanges();
      }
    }
    if (copyStatus) copyStatus.textContent = copied ? "Citation copied." : "Citation selected. Press Ctrl+C or ⌘C to copy.";
  });

  const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
  const sections = [...document.querySelectorAll("[data-nav-section][id]")];
  const readingProgress = document.getElementById("reading-progress");
  let scrollFrame = null;
  function updateScrollState() {
    scrollFrame = null;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (readingProgress) readingProgress.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    let currentSection = null;
    const activationLine = Math.min(window.innerHeight * 0.3, 240);
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) currentSection = section.id;
    });
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${currentSection}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }
  function scheduleScrollUpdate() {
    if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateScrollState);
  }
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  window.addEventListener("load", scheduleScrollUpdate);
  updateScrollState();

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.classList.add("is-visible");
          revealObserver.unobserve(target);
        }
      });
    }, { rootMargin: "0px 0px 40px 0px", threshold: 0.04 });
    document.documentElement.classList.add("js");
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }
})();
