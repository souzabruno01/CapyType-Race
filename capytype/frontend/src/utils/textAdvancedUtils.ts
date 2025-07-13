/**
 * Advanced text manipulation and generation utilities
 */

// Smart truncation function to avoid cutting mid-word or mid-sentence
export const smartTruncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  // First, try to cut at sentence boundaries
  const sentences = text.split(/[.!?]+/);
  let result = '';
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;
    
    const potentialResult = result + (result ? '. ' : '') + sentence + '.';
    
    if (potentialResult.length <= maxLength) {
      result = potentialResult;
    } else {
      break;
    }
  }
  
  // If we have a good sentence-based result, use it
  if (result.length >= maxLength * 0.7) { // At least 70% of desired length
    return result;
  }
  
  // Otherwise, cut at word boundaries
  const words = text.split(' ');
  result = '';
  
  for (let i = 0; i < words.length; i++) {
    const potentialResult = result + (result ? ' ' : '') + words[i];
    
    if (potentialResult.length <= maxLength) {
      result = potentialResult;
    } else {
      break;
    }
  }
  
  // Add proper ending punctuation if missing
  if (result && !result.match(/[.!?]$/)) {
    if (result.length < maxLength - 1) {
      result += '.';
    }
  }
  
  return result || text.substring(0, maxLength); // Fallback to hard cut if all else fails
};

// Generate topic-specific fallback text
export const generateTopicSpecificFallback = (topic: string, limit: number): string => {
  const isShort = limit <= 150;
  const isMedium = limit > 150 && limit <= 500;
  const topicLower = topic.toLowerCase();

  // Expanded topic-specific responses that match our random topics
  if (topicLower.includes('ocean') || topicLower.includes('marine') || topicLower.includes('sea')) {
    if (isShort) {
      return smartTruncate("Ocean life encompasses a vast array of marine organisms from microscopic plankton to massive whales. The ocean supports diverse ecosystems including coral reefs, deep-sea trenches, and kelp forests, each hosting unique species adapted to their specific environments.", limit);
    } else if (isMedium) {
      return smartTruncate("Ocean life represents one of Earth's most diverse and complex ecosystems, spanning from the sunlit surface waters to the mysterious depths of oceanic trenches. Marine organisms have evolved remarkable adaptations to survive in saltwater environments, from the bioluminescent creatures of the deep sea to the colorful fish that inhabit coral reefs. The ocean food chain begins with microscopic phytoplankton and extends to apex predators like sharks and whales.", limit);
    } else {
      return smartTruncate("Ocean life encompasses an extraordinary diversity of marine organisms that have evolved over millions of years to thrive in aquatic environments covering more than 70% of Earth's surface. From the smallest single-celled phytoplankton that form the foundation of marine food webs to the largest animals on Earth like blue whales, ocean ecosystems support an incredible variety of life forms. Marine environments range from shallow coastal waters and vibrant coral reefs to the perpetually dark depths of abyssal plains where unique creatures have developed bioluminescence and other remarkable adaptations to survive extreme pressure and cold temperatures.", limit);
    }
  }

  if (topicLower.includes('space') || topicLower.includes('exploration') || topicLower.includes('astronomy')) {
    if (isShort) {
      return smartTruncate("Space exploration involves the investigation of outer space through robotic spacecraft and human missions. It has led to discoveries about planets, stars, and galaxies while advancing our understanding of the universe and developing technologies that benefit life on Earth.", limit);
    } else if (isMedium) {
      return smartTruncate("Space exploration represents humanity's quest to understand the cosmos beyond Earth's atmosphere. Through robotic missions to Mars, Jupiter, and other celestial bodies, along with telescopes that peer into distant galaxies, we have discovered exoplanets, black holes, and evidence of water on other worlds. International space agencies collaborate on missions that expand our knowledge of the universe while developing technologies for satellite communication, GPS navigation, and weather forecasting.", limit);
    } else {
      return smartTruncate("Space exploration encompasses humanity's ambitious endeavors to investigate and understand the vast cosmos beyond Earth's protective atmosphere. This scientific pursuit involves sophisticated robotic spacecraft that journey to distant planets, moons, and asteroids, as well as powerful telescopes that capture light from galaxies billions of years old. Major achievements include landing rovers on Mars to search for signs of ancient life, sending probes to study the outer planets and their moons, and discovering thousands of exoplanets orbiting distant stars. Space exploration has not only revolutionized our understanding of the universe but also led to numerous technological innovations that benefit society, including satellite communications, GPS navigation systems, weather forecasting, and medical imaging technologies.", limit);
    }
  }

  if (topicLower.includes('renewable') || topicLower.includes('energy') || topicLower.includes('solar') || topicLower.includes('wind')) {
    if (isShort) {
      return smartTruncate("Renewable energy sources like solar, wind, and hydroelectric power generate electricity without depleting natural resources or producing harmful emissions. These technologies are becoming increasingly efficient and cost-effective, helping combat climate change.", limit);
    } else if (isMedium) {
      return smartTruncate("Renewable energy encompasses sustainable power sources that naturally replenish themselves, including solar panels that convert sunlight into electricity, wind turbines that harness air currents, hydroelectric dams that utilize flowing water, and geothermal systems that tap Earth's internal heat. These technologies produce clean electricity without greenhouse gas emissions, making them essential for addressing climate change while providing energy security for growing global populations.", limit);
    } else {
      return smartTruncate("Renewable energy represents a revolutionary shift toward sustainable power generation using naturally replenishing resources that don't deplete over time. Solar photovoltaic panels convert sunlight directly into electricity through semiconductor materials, while wind turbines capture kinetic energy from air currents using aerodynamically designed blades. Hydroelectric facilities harness the gravitational force of flowing water, and geothermal systems extract heat from Earth's core. These technologies have experienced dramatic cost reductions and efficiency improvements, making renewable energy increasingly competitive with fossil fuels while offering the crucial advantage of producing electricity without greenhouse gas emissions, helping nations achieve carbon neutrality goals and combat climate change.", limit);
    }
  }

  // Add more topic categories
  if (topicLower.includes('ancient') || topicLower.includes('civilization') || topicLower.includes('history')) {
    if (isShort) {
      return smartTruncate("Ancient civilizations like Egypt, Mesopotamia, Greece, and Rome developed complex societies with advanced architecture, writing systems, and governance. Their innovations in agriculture, engineering, and culture laid foundations for modern civilization.", limit);
    } else if (isMedium) {
      return smartTruncate("Ancient civilizations emerged when human societies transitioned from nomadic hunter-gatherers to settled agricultural communities. Mesopotamian city-states developed cuneiform writing, Egyptian pharaohs built monumental pyramids, Greek philosophers established democratic principles, and Roman engineers constructed roads and aqueducts that spanned continents. These civilizations created legal systems, artistic traditions, and technological innovations that continue to influence modern society.", limit);
    } else {
      return smartTruncate("Ancient civilizations represent remarkable human achievements in developing complex societies that transformed from small agricultural settlements into vast empires spanning multiple continents. Mesopotamian civilizations invented writing systems, mathematical concepts, and urban planning principles, while ancient Egypt created monumental architecture like the pyramids and developed sophisticated mummification techniques. Greek city-states pioneered democratic governance, philosophical inquiry, and scientific methodology, and the Roman Empire established legal frameworks, engineering marvels like aqueducts and roads, and administrative systems that influenced governance for centuries. These civilizations developed agriculture, metallurgy, astronomy, medicine, and artistic traditions that laid the foundational knowledge for human progress and continue to shape modern culture, law, and technology.", limit);
    }
  }

  if (topicLower.includes('wildlife') || topicLower.includes('conservation') || topicLower.includes('biodiversity')) {
    if (isShort) {
      return smartTruncate("Wildlife conservation protects endangered species and their habitats from threats like deforestation, pollution, and climate change. Conservation efforts include establishing protected areas, breeding programs, and international treaties to preserve biodiversity.", limit);
    } else if (isMedium) {
      return smartTruncate("Wildlife conservation focuses on protecting animal species and their natural habitats from human-induced threats including habitat destruction, poaching, pollution, and climate change. Conservationists establish national parks and wildlife reserves, implement breeding programs for endangered species, and work with local communities to develop sustainable practices that balance human needs with environmental protection. International organizations coordinate global efforts to prevent extinctions and maintain biodiversity.", limit);
    } else {
      return smartTruncate("Wildlife conservation represents a critical global effort to protect animal species and their natural ecosystems from the mounting pressures of human activity, habitat destruction, climate change, and environmental degradation. Conservation biologists work to establish protected areas such as national parks and wildlife reserves, implement captive breeding programs for endangered species, and develop corridor systems that allow animals to migrate safely between habitats. These efforts involve collaboration between governments, international organizations, local communities, and indigenous peoples who possess traditional ecological knowledge. Modern conservation strategies integrate scientific research, habitat restoration, anti-poaching measures, and sustainable development practices that help human communities coexist with wildlife while preserving the biodiversity essential for healthy ecosystems.", limit);
    }
  }

  // Default fallback
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  return smartTruncate(`${capitalizedTopic} is a fascinating subject that encompasses many interesting aspects and concepts. It involves various elements, processes, and relationships that have been studied and explored by researchers and experts in the field. Understanding ${topic} requires examining its fundamental principles, applications, and significance in our world today.`, limit);
};
