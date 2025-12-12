import React, { useState } from 'react'
import '../styles/public-about.css'

export default function AboutPage() {
  return (
    <div className="public-about">
      {/* Header */}
      <section className="about-header">
        <div className="section-container">
          <h1 className="page-title">About Graphic Corner</h1>
          <p className="page-subtitle">
            Our story, mission, and the team behind your brand's visual success
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="story-section">
        <div className="section-container story-layout">
          <div className="story-text">
            <h2>Our Story</h2>
            <p>
              Graphic Corner was founded in 2016 with a simple mission: to help businesses and individuals 
              create stunning visual content that tells their story. What started as a small team of passionate 
              designers has grown into a thriving creative agency serving clients worldwide.
            </p>
            <p>
              We believe that great design isn't just about aesthetics—it's about solving problems, 
              communicating ideas, and creating lasting impressions. Every project is an opportunity 
              to collaborate with talented clients and bring their visions to life.
            </p>
          </div>
          <div className="story-image">
            <div className="placeholder-image">📸</div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="mission-section">
        <div className="section-container">
          <h2 className="section-title">Our Mission & Values</h2>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To empower businesses with exceptional design that drives growth, 
                builds brand identity, and creates meaningful connections with audiences.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">💡</div>
              <h3>Innovation</h3>
              <p>
                We stay ahead of design trends and leverage cutting-edge tools 
                to deliver modern, future-proof solutions for our clients.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">🤝</div>
              <h3>Collaboration</h3>
              <p>
                Your success is our success. We work closely with you to understand 
                your vision and exceed expectations at every step.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">✨</div>
              <h3>Excellence</h3>
              <p>
                We're committed to delivering high-quality work with attention to detail 
                and a passion for perfection in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">👨‍💼</div>
              <h3>John Smith</h3>
              <p className="role">Creative Director</p>
              <p className="bio">
                Visionary leader with 10+ years of experience in brand design and creative direction. 
                Passionate about crafting meaningful visual experiences.
              </p>
            </div>
            <div className="team-card">
              <div className="team-avatar">👩‍💻</div>
              <h3>Sarah Johnson</h3>
              <p className="role">Lead Designer</p>
              <p className="bio">
                Expert in UI/UX and digital design. Loves creating user-centric solutions 
                that are both beautiful and functional.
              </p>
            </div>
            <div className="team-card">
              <div className="team-avatar">👨‍🎨</div>
              <h3>Mike Chen</h3>
              <p className="role">Video Editor</p>
              <p className="bio">
                Specialized in video production and motion graphics. Brings stories to life 
                through compelling visual narratives.
              </p>
            </div>
            <div className="team-card">
              <div className="team-avatar">👩‍🎓</div>
              <h3>Emily Rodriguez</h3>
              <p className="role">Social Media Specialist</p>
              <p className="bio">
                Social media strategist with expertise in content creation and audience engagement. 
                Helps brands build authentic communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-container">
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Graphic Corner transformed our brand's visual identity. The team was professional, 
                creative, and delivered beyond our expectations. Highly recommended!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div>
                  <p className="author-name">Alex Thompson</p>
                  <p className="author-company">Tech Startup CEO</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Working with Graphic Corner has been a game-changer for our social media presence. 
                Our engagement rates increased by 300% in just three months!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div>
                  <p className="author-name">Maria Garcia</p>
                  <p className="author-company">E-commerce Business Owner</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "The video editing service is exceptional. Fast turnaround, professional quality, 
                and unlimited revisions made the whole process stress-free."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div>
                  <p className="author-name">David Kim</p>
                  <p className="author-company">YouTuber & Content Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="cta-content">
          <h2>Let's Create Something Amazing Together</h2>
          <p>Join hundreds of satisfied clients who have transformed their brands with Graphic Corner.</p>
          <a href="/contact" className="btn btn-white">
            Start Your Project
          </a>
        </div>
      </section>
    </div>
  )
}
