import React, { useEffect, useState, useMemo } from 'react';
import '../styles/AnalogClock.css';

const AnalogClock = ({ time, name }) => {
  const [hourDegrees, setHourDegrees] = useState(0);
  const [minuteDegrees, setMinuteDegrees] = useState(0);
  const firstInitial = name.charAt(0);
  
  // Randomly select one of the three walnut background images and flip orientation
  const { walnutBackground, flipStyle } = useMemo(() => {
    // Select random image
    const walnutImages = ['walnut1.png', 'walnut2.png', 'walnut3.png'];
    const randomIndex = Math.floor(Math.random() * walnutImages.length);
    
    // Randomly decide whether to flip the image vertically
    const flipOptions = [
      {}, // no flip
      { transform: 'scaleY(-1)' } // vertical flip only
    ];
    const flipIndex = Math.floor(Math.random() * flipOptions.length);
    
    return {
      walnutBackground: walnutImages[randomIndex],
      flipStyle: flipOptions[flipIndex]
    };
  }, []);

  useEffect(() => {
    // Parse the time string (format: "h:mm a")
    const timeMatch = time.match(/(\d+):(\d+)\s+([AP]M)/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format for calculations
      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Calculate the angles for the clock hands
      // Hour hand: 30 degrees per hour + partial hour movement
      const hourAngle = (hours % 12) * 30 + minutes * 0.5;
      // Minute hand: 6 degrees per minute
      const minuteAngle = minutes * 6;
      setHourDegrees(hourAngle);
      setMinuteDegrees(minuteAngle);
    }
  }, [time]);

  return (
    <div className="analog-clock-container">
      <div className="analog-clock">
        <div className="clock-initial">
          {firstInitial}
        </div>
        <div className="clock-face">
          <img 
            src={`${process.env.PUBLIC_URL}/images/${walnutBackground}`} 
            alt="Walnut background" 
            className="clock-background-image" 
            style={flipStyle}
          />
          <img src={`${process.env.PUBLIC_URL}/images/clock_face.png`} alt="Clock face" className="clock-face-image" />
          <img 
            src={`${process.env.PUBLIC_URL}/images/hour_hand.png`} 
            alt="Hour hand" 
            className="hour-hand" 
            style={{ transform: `rotate(${hourDegrees}deg)` }} 
          />
          <img 
            src={`${process.env.PUBLIC_URL}/images/minute_hand.png`} 
            alt="Minute hand" 
            className="minute-hand" 
            style={{ transform: `rotate(${minuteDegrees}deg)` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default AnalogClock;
