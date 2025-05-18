import React, { useEffect } from "react";
import "../styles/footer.scss";

import footerBg from "../assets/footer-bg.png";
import logo from '../assets/Lycée de Ezzauada logo.png';

const Footer = () => {
    // This effect ensures the footer stays at the bottom, even during page loading
    useEffect(() => {
        const fixFooterPosition = () => {
            const footer = document.querySelector('.footer');
            const content = document.querySelector('.content-container') || document.body;
            
            if (footer) {
                const contentHeight = window.innerHeight - footer.offsetHeight;
                content.style.minHeight = `${contentHeight}px`;
            }
        };
        
        // Run once on mount
        fixFooterPosition();
        
        // Add event listener for window resize
        window.addEventListener('resize', fixFooterPosition);
        window.addEventListener('load', fixFooterPosition);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', fixFooterPosition);
            window.removeEventListener('load', fixFooterPosition);
        };
    }, []);
    
    return (
    <footer
        className="footer"
        style={{ backgroundImage: `url(${footerBg})` }}
    >
        <div className="footer-top section">
            <div className="container grid-list">
                <div className="footer-brand">
                    <a href="#" className="logo">
                        <img
                            src={logo}
                            width="162" 
                            height="50"
                            alt="Lycée de Ezzauada"
                        />
                    </a>
                    <p className="footer-brand-text">
                        Lorem ipsum dolor amet consecto adi pisicing elit sed eiusm tempor incidid unt labore dolore.
                    </p>

                    <div className="wrapper">
                        <span className="span">Add:</span>
                        <address className="address">
                           Zawada Larache
                        </address>
                    </div>

                    <div className="wrapper">
                        <span className="span">Call:</span>
                        <a href="tel:+011234567890" className="footer-link">
                            +01 123 4567 890
                        </a>
                    </div>

                    <div className="wrapper">
                        <span className="span">Email:</span>
                        <a href="mailto:info@eduweb.com" className="footer-link">
                           Zawada School
                        </a>
                    </div>
                </div>

                <ul className="footer-list">
                    <li>
                        <p className="footer-list-title">Online Platform</p>
                    </li>
                    <li><a href="#" className="footer-link">About</a></li>
                    <li><a href="#" className="footer-link">Courses</a></li>
                    
                </ul>

                <ul className="footer-list">
                    <li>
                        <p className="footer-list-title">Links</p>
                    </li>
                    <li><a href="#" className="footer-link">Contact Us</a></li>
                    <li><a href="#" className="footer-link">Gallery</a></li>
                    <li><a href="#" className="footer-link">News & Articles</a></li>
                    <li><a href="#" className="footer-link">FAQ's</a></li>
                    <li><a href="#" className="footer-link">Sign In/Registration</a></li>
                    <li><a href="#" className="footer-link">Coming Soon</a></li>
                </ul>

                <div className="footer-list">
                    <p className="footer-list-title">Contacts</p>
                    <p className="footer-list-text">
                        Enter your email address to register to our newsletter subscription
                    </p>

                    <form action="" className="newsletter-form">
                        <input
                            type="email"
                            name="email_address"
                            placeholder="Your email"
                            required
                            className="input-field"
                        />
                        <button type="submit" className="btn has-before">
                            <span className="span">Subscribe</span>
                            <ion-icon name="arrow-forward-outline" aria-hidden="true" />
                        </button>
                    </form>

                    <ul className="social-list">
                        {["facebook", "linkedin", "instagram", "twitter", "youtube"].map(platform => (
                            <li key={platform}>
                                <a href="#" className="social-link">
                                    <ion-icon name={`logo-${platform}`} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <div className="footer-bottom">
            <div className="container">
                <p className="copyright">
                    Copyright 2025 All Rights Reserved by{" "}
                    <a href="#" className="copyright-link">
                        ISTA LARACHE
                    </a>
                </p>
            </div>
        </div>
    </footer>
    );
};

export default Footer;
