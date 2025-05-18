import React, { useEffect, memo } from "react";
import { Link } from "react-router-dom";

// Import the SVG directly as it's working fine
import heroBg from "../assets/hero-bg.svg";

// Use absolute paths or import directly from the assets folder
import heroShape2 from "../assets/hero-shape-2.png";
import student1 from "../assets/student-1.jpeg";
import student2 from "../assets/Student-2.jpg";

// Import the enhanced hero styles
import "./hero.css";

// Preload critical images for better performance
const preloadImages = () => {
    const imagesToPreload = [student1, student2, heroShape2];
    imagesToPreload.forEach(image => {
        const preloadLink = document.createElement("link");
        preloadLink.href = typeof image === 'string' ? image : image.toString();
        preloadLink.rel = "preload";
        preloadLink.as = "image";
        document.head.appendChild(preloadLink);
    });
};

const Hero = () => {
    // Preload critical images on component mount
    useEffect(() => {
        preloadImages();
    }, []);
    return (
        <section
            className="section hero has-bg-image"
            id="home"
            aria-label="home"
            style={{ backgroundImage: `url(${heroBg})` }} 
        >
            <div className="container">
                <div className="hero-content">
                    <h1 className="h1 section-title">
                        Welcome To <span className="span">Ezzouada</span> School
                    </h1>
                    <p className="hero-text">
                        In Your Website School You can Find Courses & Announcements And Chat With Your Admin
                    </p>
                    <Link to="/courses" className="btn hero-btn">
                        Explore Courses
                        <ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon>
                    </Link>
                </div>

                <figure className="hero-banner">
                    <div className="img-holder one" style={{ '--width': '270', '--height': '300' }}>
                        <img 
                            src={student1} 
                            width="270" 
                            height="300" 
                            alt="Student studying at Ezzouada School" 
                            className="img-cover" 
                            loading="eager"
                        />
                    </div>

                    <div className="img-holder two" style={{ '--width': '240', '--height': '370' }}>
                        <img 
                            src={student2} 
                            width="240" 
                            height="370" 
                            alt="Student at the library" 
                            className="img-cover"
                        />
                    </div>

                    <img 
                        src={heroShape2} 
                        width="622" 
                        height="551" 
                        alt="" 
                        className="shape hero-shape-2" 
                    />
                </figure>
            </div>
        </section>
    );
};

// Memoize the Hero component to prevent unnecessary re-renders
export default memo(Hero);
