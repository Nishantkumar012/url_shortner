import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { useNavigate } from "react-router";

const logo =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

const qrCode =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCqhbartTA558OvP0ArwRe55ohdHm1BZacApC0mhQ8txYLk8LeKSigXxuV82zFdiJiYdkzo4BiHRjOsqGSy8PL4NiNZHWhc-WMMwBD5cjxznrCpQ18kXdA_JnP4QYW4xZ4TNgxp28Fy6v2lVvIfW2uCR4eCl3XfySj2cHddN7fRi2Nc_Iz31WWPhGmLdCet0tHhrmV_ZB8xEIbiufplPz33l0ARCdK2Oi9i17vw3qGc-9hL91ddxClL";

function Icon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {children}
    </span>
  );
}

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );

    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    const geometries = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.TorusGeometry(0.3, 0.1, 16, 100),
      new THREE.OctahedronGeometry(0.4, 0),
    ];

    const material = new THREE.MeshPhongMaterial({
      color: 0x7c3aed,
      shininess: 100,
      transparent: true,
      opacity: 0.6,
    });

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);

    scene.add(directionalLight);
    scene.add(new THREE.AmbientLight(0x404040));

    const shapes: {
      mesh: THREE.Mesh;
      speed: number;
      rotSpeed: number;
    }[] = [];

    for (let i = 0; i < 15; i++) {
      const geometry =
        geometries[Math.floor(Math.random() * geometries.length)];

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
      );

      scene.add(mesh);

      shapes.push({
        mesh,
        speed: Math.random() * 0.01 + 0.005,
        rotSpeed: Math.random() * 0.02,
      });
    }

    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      shapes.forEach((shape) => {
        shape.mesh.rotation.x += shape.rotSpeed;
        shape.mesh.rotation.y += shape.rotSpeed;

        shape.mesh.position.y += shape.speed;

        if (shape.mesh.position.y > 6) {
          shape.mesh.position.y = -6;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const resize = () => {
      if (!container) return;

      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;

      renderer.setSize(newWidth, newHeight);

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);

      shapes.forEach(({ mesh }) => {
        scene.remove(mesh);
      });

      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
         className="fixed inset-0 z-0 h-screen w-screen pointer-events-none opacity-40"
      // className="absolute inset-0 h-full w-full opacity-40"
    />
  );
}

function App() {
  const [url, setUrl] = useState(
    "https://very-long-and-complex-url.com/analytics/dashboard"
  );

  const [customAlias, setCustomAlias] = useState(false);
  const [passwordProtection, setPasswordProtection] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-on-surface">
      {/* NAVBAR */} 
      <ThreeBackground/>

      <nav className="fixed top-0 z-50 h-20 w-full border-b border-white/10 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-container-max items-center justify-between px-gutter">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="SnapLink Logo"
              className="h-10 w-10 object-contain"
            />

            <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
              SnapLink
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="border-b-2 border-primary pb-1 font-body-md font-bold text-primary transition-all duration-200 hover:scale-105"
            >
              Features
            </a>

            <a
              href="#pricing"
              className="font-body-md text-on-surface-variant transition-all duration-200 hover:scale-105 hover:text-primary"
            >
              Pricing
            </a>

            <a
              href="#docs"
              className="font-body-md text-on-surface-variant transition-all duration-200 hover:scale-105 hover:text-primary"
            >
              Docs
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button className="font-body-md text-on-surface-variant transition-colors hover:text-primary"
              onClick={()=>{navigate("/login")}}
             >
              Login
            </button>

            <button className="rounded-lg bg-primary-container px-6 py-2 font-bold text-on-primary-container transition-transform hover:scale-105 active:scale-95"
              onClick={()=>{navigate("/signup")}}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}

      <header className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          {/* <ThreeBackground /> */}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-container-max px-gutter text-center">
          <div className="reveal-up">
            <h1 className="mx-auto mb-6 max-w-3xl font-headline-xl text-headline-xl leading-tight text-white">
              Shorten URLs.
              <br />

              <span className="text-primary">
                Share Smarter.
              </span>
            </h1>

            <p className="mx-auto mb-12 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              The professional-grade link management platform for developers
              and teams. Track everything, optimize everywhere.
            </p>
          </div>

          {/* URL INPUT */}

          <div className="reveal-up delay-1 mx-auto max-w-3xl rounded-xl border border-white/10 bg-surface-container-low p-2 shadow-2xl">
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="flex flex-1 items-center rounded-lg border border-outline-variant/30 bg-background px-4 transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <Icon className="mr-3 text-on-surface-variant">
                  link
                </Icon>

                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border-none bg-transparent py-4 font-code text-white outline-none placeholder:text-on-surface-variant/40 focus:ring-0"
                  placeholder="https://very-long-and-complex-url.com/analytics/dashboard"
                  type="text"
                />
              </div>

              <button className="flex items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-4 font-bold text-on-primary-container transition-all hover:brightness-110">
                <span>Shorten URL</span>

                <Icon>bolt</Icon>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4 px-4 pb-2">
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={customAlias}
                  onChange={(e) => setCustomAlias(e.target.checked)}
                  className="rounded border-outline-variant bg-background text-primary focus:ring-primary"
                />

                <span className="font-label-md text-body-sm text-on-surface-variant transition-colors group-hover:text-white">
                  Custom Alias
                </span>
              </label>

              <span className="text-body-sm text-on-surface-variant/20">
                |
              </span>

              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={passwordProtection}
                  onChange={(e) =>
                    setPasswordProtection(e.target.checked)
                  }
                  className="rounded border-outline-variant bg-background text-primary focus:ring-primary"
                />

                <span className="font-label-md text-body-sm text-on-surface-variant transition-colors group-hover:text-white">
                  Password Protection
                </span>
              </label>
            </div>
          </div>

          {/* RESULT CARD */}

          <div className="glass reveal-up delay-2 group relative mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-primary/20 p-6 transition-colors hover:border-primary/40">
            <div className="absolute right-0 top-0 p-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">
                <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                Ready
              </span>
            </div>

            <div className="flex items-start gap-6">
              <div className="hidden sm:block">
                <div className="h-24 w-24 rounded-lg bg-white p-2">
                  <img
                    src={qrCode}
                    className="h-full w-full"
                    alt="SnapLink QR Code"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="mb-4">
                  <span className="mb-1 block font-label-md text-body-sm text-on-surface-variant">
                    Original URL
                  </span>

                  <p className="truncate font-code text-white opacity-50">
                    {url}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="mb-1 block font-label-md text-body-sm text-primary">
                      SnapLink
                    </span>

                    <p className="font-code text-2xl font-bold tracking-tight text-white">
                      snap.link/dev-metrics
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-lg border border-white/5 bg-surface-container-high p-2 transition-colors hover:bg-surface-container-highest">
                      <Icon className="text-primary">
                        content_copy
                      </Icon>
                    </button>

                    <button className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary-container/20 px-4 py-2 text-body-sm font-bold text-primary transition-all hover:bg-primary-container/30">
                      <Icon className="text-[18px]">
                        insights
                      </Icon>

                      Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}

      <section
        id="features"
        className="mx-auto max-w-container-max px-gutter py-stack-xl"
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-headline-lg text-headline-lg text-white">
            Engineered for Reliability
          </h2>

          <p className="mx-auto max-w-xl font-body-md text-on-surface-variant">
            Everything you need to manage your digital footprint with surgical
            precision.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* SHORTENING */}

          <div className="glass glow-hover group relative flex h-64 flex-col justify-between overflow-hidden rounded-xl p-8 transition-all md:col-span-2">
            <div className="relative z-10">
              <Icon className="mb-4 text-4xl text-primary">
                speed
              </Icon>

              <h3 className="mb-2 font-headline-md text-headline-md text-white">
                Instant Shortening
              </h3>

              <p className="max-w-md font-body-md text-on-surface-variant">
                Global edge-network delivery ensures your links resolve in
                milliseconds, no matter where your users are located.
              </p>
            </div>

            <div className="absolute bottom-[-20%] right-[-10%] h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10" />
          </div>

          {/* CUSTOM ALIASES */}

          <div className="glass glow-hover flex h-64 flex-col justify-between rounded-xl p-8 transition-all">
            <div>
              <Icon className="mb-4 text-4xl text-tertiary">
                edit_note
              </Icon>

              <h3 className="mb-2 font-headline-md text-headline-md text-white">
                Custom Aliases
              </h3>
            </div>

            <p className="font-body-sm text-on-surface-variant">
              Personalize your links to match your brand and increase CTR by up
              to 40%.
            </p>
          </div>

          {/* QR */}

          <div className="glass glow-hover flex h-64 flex-col justify-between rounded-xl p-8 transition-all">
            <div>
              <Icon className="mb-4 text-4xl text-secondary">
                qr_code_2
              </Icon>

              <h3 className="mb-2 font-headline-md text-headline-md text-white">
                Dynamic QR
              </h3>
            </div>

            <p className="font-body-sm text-on-surface-variant">
              Generate vector QR codes that update in real-time, even after
              they're printed.
            </p>
          </div>

          {/* ANALYTICS */}

          <div className="glass glow-hover flex h-auto min-h-[16rem] flex-col items-center gap-8 rounded-xl p-8 transition-all md:col-span-2 md:flex-row">
            <div className="flex-1">
              <Icon className="mb-4 text-4xl text-primary">
                query_stats
              </Icon>

              <h3 className="mb-2 font-headline-md text-headline-md text-white">
                Real-time Analytics
              </h3>

              <p className="font-body-md text-on-surface-variant">
                Track geolocation, device types, and referral sources with
                absolute privacy compliance.
              </p>
            </div>

            <div className="flex h-32 w-full items-end gap-1 rounded-lg border border-white/5 bg-surface-container p-4 md:w-64">
              <div className="h-1/2 flex-1 rounded-t-sm bg-primary/20" />
              <div className="h-3/4 flex-1 rounded-t-sm bg-primary/40" />
              <div className="h-2/3 flex-1 rounded-t-sm bg-primary/60" />
              <div className="h-full flex-1 rounded-t-sm bg-primary" />
              <div className="h-4/5 flex-1 rounded-t-sm bg-primary/80" />
            </div>
          </div>

          {/* SECURITY */}

          <div className="glass glow-hover flex h-64 flex-col justify-between rounded-xl p-8 transition-all">
            <div>
              <Icon className="mb-4 text-4xl text-error">
                security
              </Icon>

              <h3 className="mb-2 font-headline-md text-headline-md text-white">
                Enterprise Security
              </h3>
            </div>

            <p className="font-body-sm text-on-surface-variant">
              2FA, SSO, and advanced encryption protocols to keep your data safe
              and private.
            </p>
          </div>

          {/* API */}

          <div className="glass glow-hover flex min-h-[16rem] flex-col justify-between rounded-xl p-8 transition-all md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <Icon className="text-4xl text-on-surface">
                terminal
              </Icon>

              <span className="font-code text-sm text-primary">
                v1.2.4-stable
              </span>
            </div>

            <div>
              <h3 className="mb-2 font-headline-md text-headline-md text-white">
                Developer First API
              </h3>

              <p className="mb-4 font-body-md text-on-surface-variant">
                Integrate shortening directly into your CI/CD pipeline with our
                RESTful API and SDKs.
              </p>

              <div className="rounded-lg border border-white/5 bg-background p-4 font-code text-sm">
                <span className="text-secondary">curl</span>
                {" -X POST https://api.snap.link/v1/shorten \\"}
                <br />
                {"  -H "}
                <span className="text-tertiary">
                  "Authorization: Bearer $KEY"
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}

      <section
        id="pricing"
        className="bg-surface-container-lowest py-stack-xl"
      >
        <div className="mx-auto max-w-container-max px-gutter">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-headline-lg text-headline-lg text-white">
              Scale with Your Business
            </h2>

            <p className="mx-auto max-w-xl font-body-md text-on-surface-variant">
              Flexible plans designed for individuals, growing teams, and large
              enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <PricingCard
              title="Starter"
              price="$0"
              suffix="/mo"
              items={[
                "50 links per month",
                "Basic analytics",
                "Community support",
              ]}
              button="Start for Free"
            />

            <PricingCard
              title="Professional"
              price="$19"
              suffix="/mo"
              items={[
                "Unlimited short links",
                "Custom domains (3)",
                "Advanced pixel tracking",
                "Priority API access",
              ]}
              button="Go Professional"
              featured
            />

            <PricingCard
              title="Enterprise"
              price="Custom"
              items={[
                "Unlimited domains",
                "SSO & SAML",
                "dedicated Account Manager",
                "99.9% Uptime SLA",
              ]}
              button="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}

      <section className="mx-auto max-w-container-max px-gutter py-stack-xl">
        <div className="mb-16 text-center">
          <h2 className="font-headline-lg text-headline-lg text-white">
            Trusted by Market Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Testimonial
            name="Sarah Jenkins"
            role="CTO at TechFlow"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBeGA2z5dCRLSZejD4ToyWFFEOXOLe89sWCRZ2lQSeF1_hEcI2fMR6VF7xeIfDqGMalC25DmF3Mu4LpdLwVT6b8civlj6wJFXCCCRFRPxLc3BZwi-e4MxMwMZO-iTBBEC9utXHWId_YcKJHKb_kpwwCc8OVLtirJPaU9Tj2QMAzSp-wr2-q04WRDFoGaDc-WQjdEza05eEkCJZG4JbalBx7JpZYfuNz8D5QJ6KcKd2UkUQEXqDhcDO7"
          >
            "SnapLink has revolutionized how we track our marketing campaigns.
            The API is a dream to work with."
          </Testimonial>

          <Testimonial
            name="Marcus Thorne"
            role="Growth Lead at Nexus"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCh7N8-mR4DZ-rkn2uWW3xHynI05K1zK9AjtIAY9ia8TRHhoT1GYmCsb5cvPtLoeTeh5h-rqrX6ze10bt-soDVf7eDKlcXLdygbUYjrwNxu1nJq7S7igrgLREZM1wGEMMnwBJ6ICD74IWp7pws24GCQYOisFbtwzZI9FzKAIb5RGBjPt04NyquzRnhjDXyrlFkBkpYLL6N8Lw5oHhVYglPDd8MA5Cs9MQgnNtETKYjTFNMpCQQuZo2X"
          >
            "The custom aliases and QR code features are top-notch. Our
            offline-to-online conversion increased by 25%."
          </Testimonial>

          <Testimonial
            name="Elena Rodriguez"
            role="Founder of Sparkly"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDP_Hna20bk_UpgffvsF9XNClNOqxWGE3RBmHmTV8ppjsPKWJj0_ft4mZlgvW7jy8hGBskXdCxV4Hu-52rqrLPbavAhficBw7qhVkM6DR5WRIh0-JIEFnvRt1I78altQuyRcGyS2MCy_paFbaxzhUat9HlIMvYm5HR-93JzwSprXpG06kThNiudwSLVYjGf4ysuLx4bWWn-YZnFE1qv8h6RkTb225_tQ7IO7OkV3Jhd5DsM4n9Q24qe"
          >
            "Best link management platform on the market. The dark mode
            interface is beautiful and highly functional."
          </Testimonial>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="mt-stack-xl w-full border-t border-white/5 bg-surface-container-lowest py-stack-xl">
        <div className="mx-auto grid max-w-container-max grid-cols-2 gap-stack-lg px-gutter md:grid-cols-5">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <img
                src={logo}
                alt="SnapLink Logo"
                className="h-8 w-8 object-contain"
              />

              <span className="font-bold text-on-surface">
                SnapLink
              </span>
            </div>

            <p className="mb-6 max-w-xs font-body-sm text-on-surface-variant">
              Built for performance. The modern way to handle your digital
              links.
            </p>

            <div className="flex gap-4">
              <a
                href="#"
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                <Icon>public</Icon>
              </a>

              <a
                href="#"
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                <Icon>alternate_email</Icon>
              </a>
            </div>
          </div>

          <FooterLinks
            title="Product"
            links={["Features", "API", "Integrations"]}
          />

          <FooterLinks
            title="Legal"
            links={["Privacy", "Terms", "Security"]}
          />

          <FooterLinks
            title="Support"
            links={["Docs", "Community", "Status"]}
          />
        </div>

        <div className="mx-auto mt-12 flex max-w-container-max flex-col items-center justify-between gap-4 border-t border-white/5 px-gutter pt-8 md:flex-row">
          <span className="font-body-sm text-on-surface-variant">
            © 2024 SnapLink. Built for performance.
          </span>

          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-tertiary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />

            All Systems Operational
          </span>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  title,
  price,
  suffix,
  items,
  button,
  featured = false,
}: {
  title: string;
  price: string;
  suffix?: string;
  items: string[];
  button: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "glass relative z-10 flex scale-105 flex-col rounded-xl border-2 border-primary bg-surface p-8 shadow-2xl"
          : "glass flex flex-col rounded-xl border border-white/5 p-8 transition-all hover:border-white/10"
      }
    >
      {featured && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-on-primary-container">
          Best Value
        </div>
      )}

      <span
        className={`mb-2 font-label-md uppercase ${
          featured ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        {title}
      </span>

      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">
          {price}
        </span>

        {suffix && (
          <span className="font-body-sm text-on-surface-variant">
            {suffix}
          </span>
        )}
      </div>

      <ul className="mb-12 flex-1 space-y-4">
        {items.map((item) => (
          <li
            key={item}
            className={`flex items-center gap-2 text-body-sm ${
              featured
                ? "font-medium text-white"
                : "text-on-surface-variant"
            }`}
          >
            <Icon
              className={`text-[18px] ${
                featured ? "text-primary" : "text-tertiary"
              }`}
            >
              check_circle
            </Icon>

            {item}
          </li>
        ))}
      </ul>

      <button
        className={
          featured
            ? "w-full rounded-lg bg-primary-container py-3 font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:brightness-110"
            : "w-full rounded-lg border border-white/10 py-3 font-bold text-white transition-colors hover:bg-white/5"
        }
      >
        {button}
      </button>
    </div>
  );
}

function Testimonial({
  name,
  role,
  image,
  children,
}: {
  name: string;
  role: string;
  image: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl border border-white/5 p-6">
      <div className="mb-4 flex items-center gap-4">
        <div
          className="h-12 w-12 rounded-full border-2 border-primary/20 bg-cover bg-center"
          style={{ backgroundImage: `url("${image}")` }}
        />

        <div>
          <h4 className="text-body-md font-bold text-white">
            {name}
          </h4>

          <p className="text-body-sm text-on-surface-variant">
            {role}
          </p>
        </div>
      </div>

      <p className="font-body-sm italic text-on-surface-variant">
        {children}
      </p>
    </div>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h5 className="mb-4 font-label-md font-bold uppercase tracking-wider text-white">
        {title}
      </h5>

      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="font-body-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;


// import React from 'react';
// import Hero from './components/ui';

// function App() {
//   const handlePrimaryClick = () => {
//     console.log('Get Started clicked');
//     // TODO: navigate or show modal
//   };

//   const handleSecondaryClick = () => {
//     console.log('Explore Features clicked');
//     // TODO: navigate or show modal
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Hero
//         trustBadge={{
//           text: "Trusted by forward-thinking teams.",
//           icons: ["✨"],
//         }}
//         headline={{
//           line1: "Launch Your",
//           line2: "Workflow Into Orbit",
//         }}
//         subtitle="Supercharge productivity with AI-powered automation and integrations built for the next generation of teams — fast, seamless, and limitless."
//         buttons={{
//           primary: {
//             text: "Get Started for Free",
//             onClick: handlePrimaryClick,
//           },
//           secondary: {
//             text: "Explore Features",
//             onClick: handleSecondaryClick,
//           },
//         }}
//         className="hero-container"
//       />
//       {/* Additional content could go here */}
//     </div>
//   );
// }

// export default App;