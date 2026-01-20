import React from 'react';

export function FollowItForm() {
  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          margin-top: 20px !important;
          padding: clamp(17px, 5%, 40px) clamp(17px, 7%, 50px) !important;
          max-width: none !important;
          border-radius: 16px !important;
          box-shadow: 0 5px 25px rgba(34, 60, 47, 0.1) !important;
          background-color: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview,
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview * {
          box-sizing: border-box !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-heading {
          width: 100% !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-heading h5 {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          font-family: inherit !important;
          font-weight: bold !important;
          color: currentColor !important;
          font-size: 1.25rem !important;
          text-align: center !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-input-field {
          margin-top: 20px !important;
          width: 100% !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-input-field input {
          width: 100% !important;
          height: 48px !important;
          border-radius: 9999px !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
          outline: none !important;
          color: currentColor !important;
          font-family: inherit !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          line-height: 20px !important;
          text-align: center !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-input-field input::placeholder {
          color: currentColor !important;
          opacity: 0.5 !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-submit-button {
          margin-top: 15px !important;
          width: 100% !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-submit-button button {
          width: 100% !important;
          height: 48px !important;
          border: 0 !important;
          border-radius: 9999px !important;
          line-height: 0px !important;
          background-color: #BEF264 !important; /* Limon green from ref */
          color: #000 !important;
          font-weight: bold !important;
          font-size: 16px !important;
          cursor: pointer !important;
          transition: transform 0.2s !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-submit-button button:hover {
          transform: scale(1.02) !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .powered-by-line {
          color: currentColor !important;
          opacity: 0.6 !important;
          font-family: inherit !important;
          font-size: 12px !important;
          font-weight: 400 !important;
          line-height: 25px !important;
          text-align: center !important;
          text-decoration: none !important;
          display: flex !important;
          width: 100% !important;
          justify-content: center !important;
          align-items: center !important;
          margin-top: 10px !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .powered-by-line img {
          margin-left: 8px !important;
          height: 14px !important;
          filter: grayscale(1) invert(1);
        }
        .light .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .powered-by-line img {
          filter: none;
        }
      ` }} />
      <div className="followit--follow-form-container" attr-a="" attr-b="" attr-c="" attr-d="" attr-e="" attr-f="">
        <form 
          action="https://api.follow.it/subscription-form/N29PcWtOajR4Tzh6MDcvc1JZWGxsd0dWbWZVTVJFZE44TGthdkVSTlRqYnRDSVBMV2dFYk95YXFRNDhBUE1udXJJbkV0a3k3WjB3Q2JrQVppeGlUYUQwK25Oa3REVTVYUFVnWGJ4anIzMml5MERXa1o5RGRnd1dwWTgyeTdGWVF8RzA5aklsWTBHZjd0SXhQNU9wckp6bTdSazFpNlVkVG01bEtvakNZaTNzdz0=/21" 
          method="post"
        >
          <div className="form-preview" style={{ position: 'relative' }}>
            <div className="preview-heading">
              <h5 style={{ textTransform: 'none' }}>Get new posts by email</h5>
            </div>
            <div className="preview-input-field">
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="Enter your email" 
                spellCheck="false" 
                style={{ textTransform: 'none' }} 
              />
            </div>
            <div className="preview-submit-button">
              <button type="submit" style={{ textTransform: 'none' }}>
                Subscribe
              </button>
            </div>
          </div>
        </form>
        <a href="https://follow.it" className="powered-by-line" target="_blank" rel="noopener noreferrer">
          Powered by <img src="https://follow.it/images/colored-logo.svg" alt="follow.it" />
        </a>
      </div>
    </div>
  );
}
