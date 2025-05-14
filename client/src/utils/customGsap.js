import { SplitText } from "gsap/SplitText";

// This is a mock implementation of SplitText for GSAP
// Add this if the official SplitText plugin isn't available (as it's a premium plugin)
try {
  // First try to use the imported SplitText from GSAP if available
  if (SplitText) {
    window.SplitText = SplitText;
  }
} catch (e) {
  // If SplitText isn't available from GSAP, create our custom implementation
  class CustomSplitText {
    constructor(element, options) {
      this.element = element;
      this.options = options;
      this.init();
    }

    init() {
      const element = this.element;
      const text = element.textContent;
      element.textContent = '';
      
      this.chars = [];
      this.words = [];
      
      const words = text.split(' ');
      
      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.position = 'relative';
        
        this.words.push(wordSpan);
        
        const chars = word.split('');
        
        chars.forEach((char, charIndex) => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.style.display = 'inline-block';
          charSpan.style.position = 'relative';
          charSpan.textContent = char;
          
          this.chars.push(charSpan);
          wordSpan.appendChild(charSpan);
        });
        
        element.appendChild(wordSpan);
        
        // Add space between words except for the last word
        if (wordIndex < words.length - 1) {
          const space = document.createElement('span');
          space.innerHTML = ' ';
          element.appendChild(space);
        }
      });
    }
    
    revert() {
      if (this.element) {
        const originalText = this.chars.map(char => char.textContent).join('');
        this.element.innerHTML = originalText;      }
    }
  }
  
  window.SplitText = CustomSplitText;
}
