import React from 'react';

export function FollowItForm() {
  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          margin-top: 30px !important;
          padding: clamp(17px, 5%, 40px) clamp(17px, 7%, 50px) !important;
          max-width: none !important;
          border-radius: 6px !important;
          box-shadow: 0 5px 25px rgba(34, 60, 47, 0.25) !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview,
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview *{
          box-sizing: border-box !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-heading {
          width: 100% !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-heading h5{
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-input-field {
          margin-top: 20px !important;
          width: 100% !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-input-field input {
          width: 100% !important;
          height: 40px !important;
          border-radius: 6px !important;
          border: 2px solid #e9e8e8 !important;
          background-color: #fff;
          outline: none !important;
          color: #000000 !important;
          font-family: "Montserrat", Arial, sans-serif !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          line-height: 20px !important;
          text-align: center !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-input-field input::placeholder {
          color: #000000 !important;
          opacity: 1 !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-submit-button {
          margin-top: 10px !important;
          width: 100% !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .form-preview .preview-submit-button button {
          width: 100% !important;
          height: 40px !important;
          border: 0 !important;
          border-radius: 6px !important;
          line-height: 0px !important;
          cursor: pointer !important;
        }
        .followit--follow-form-container[attr-a][attr-b][attr-c][attr-d][attr-e][attr-f] .powered-by-line {
          color: #231f20 !important;
          font-family: "Montserrat", Arial, sans-serif !important;
          font-size: 13px !important;
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
          margin-left: 10px !important;
          height: 1.13em !important;
          max-height: 1.13em !important;
        }
      ` }} />
      <div className="followit--follow-form-container" attr-a="" attr-b="" attr-c="" attr-d="" attr-e="" attr-f="">
        <form 
          action="https://api.follow.it/subscription-form/N29PcWtOajR4Tzh6MDcvc1JZWGxsd0dWbWZVTVJFZE44TGthdkVSTlRqYnRDSVBMV2dFYk95YXFRNDhBUE1udXJJbkV0a3k3WjB3Q2JrQVppeGlUYUQwK25Oa3REVTVYUFVnWGJ4anIzMml5MERXa1o5RGRnd1dwWTgyeTdGWVF8RzA5aklsWTBHZjd0SXhQNU9wckp6bTdSazFpNlVkVG01bEtvakNZaTNzdz0=/21" 
          method="post"
        >
          <div className="form-preview" style={{ backgroundColor: 'rgb(246, 224, 245)', position: 'relative' }}>
            <div className="preview-heading">
              <h5 style={{ fontFamily: 'Arial', fontWeight: 'bold', color: 'rgb(0, 0, 0)', fontSize: '16px', textAlign: 'center', textTransform: 'none' }}>
                Get new posts by email
              </h5>
            </div>
            <div className="preview-input-field">
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="Enter your email" 
                spellCheck="false" 
                style={{ fontFamily: 'Arial', fontWeight: 'normal', color: 'rgb(0, 0, 0)', fontSize: '14px', textAlign: 'center', backgroundColor: 'rgb(255, 255, 255)', textTransform: 'none' }} 
              />
            </div>
            <div className="preview-submit-button">
              <button 
                type="submit" 
                style={{ fontFamily: 'Arial', fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '16px', textAlign: 'center', backgroundColor: 'rgb(0, 0, 0)', textTransform: 'none' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </form>
        <a href="https://follow.it" className="powered-by-line" target="_blank" rel="noopener noreferrer">
          Powered by <img src="https://follow.it/images/colored-logo.svg" alt="follow.it" height="17px" />
        </a>
      </div>
    </div>
  );
}
