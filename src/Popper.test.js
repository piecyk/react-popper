// @flow
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import * as PopperJs from '@popperjs/core';
import type { Ref } from './RefTypes';

// Public API
import { Popper } from '.';

const renderPopper = (props) =>
  render(
    <Popper {...props}>
      {({ ref, style, placement, arrowProps }) => (
        <div ref={ref} style={style} data-placement={placement}>
          <div {...arrowProps} />
          {placement}
        </div>
      )}
    </Popper>
  );

const handleRef = (ref: Ref) => (node: ?HTMLElement) => {
  if (typeof ref === 'function') {
    ref(node);
  } else if (typeof ref === 'function') {
    ref.current = node;
  }
};

describe('Popper component', () => {
  it('renders the expected markup', async () => {
    const referenceElement = document.createElement('div');

    const { asFragment } = renderPopper({ referenceElement });

    await screen.findByText(/^bottom$/);

    expect(asFragment()).toMatchSnapshot();
  });

  it('handles changing refs gracefully', async () => {
    const referenceElement = document.createElement('div');

    await waitFor(() => {
      expect(() =>
        render(
          <Popper referenceElement={referenceElement}>
            {({ ref, style, placement, arrowProps }) => (
              <div
                ref={handleRef(ref)}
                style={style}
                data-placement={placement}
              >
                <div {...arrowProps} ref={handleRef(arrowProps.ref)} />
              </div>
            )}
          </Popper>
        )
      ).not.toThrow();
    });
  });

  it('accepts a ref function', async () => {
    const myRef = jest.fn();
    const referenceElement = document.createElement('div');

    render(
      <Popper referenceElement={referenceElement} innerRef={myRef}>
        {({ ref, style, placement }) => (
          <div ref={ref} style={style} data-placement={placement} />
        )}
      </Popper>
    );

    await waitFor(() => {
      expect(myRef).toBeCalled();
    });
  });

  it('accepts a ref object', async () => {
    const myRef = React.createRef();
    const referenceElement = document.createElement('div');

    render(
      <Popper referenceElement={referenceElement} innerRef={myRef}>
        {({ ref, style, placement }) => (
          <div ref={ref} style={style} data-placement={placement} />
        )}
      </Popper>
    );

    await waitFor(() => {
      expect(myRef.current).toBeDefined();
    });
  });

  it('accepts a `referenceElement` property', async () => {
    const spy = jest.spyOn(PopperJs, 'createPopper');
    const virtualReferenceElement = {
      getBoundingClientRect(): any {
        return {
          top: 10,
          left: 10,
          bottom: 20,
          right: 100,
          width: 90,
          height: 10,
        };
      },
    };
    renderPopper({
      referenceElement: virtualReferenceElement,
    });
    await waitFor(() => {
      expect(spy.mock.calls[0][0]).toBe(virtualReferenceElement);
    });
  });

  it(`should update placement when property is changed`, async () => {
    const referenceElement = document.createElement('div');

    const Component = ({ placement }) => (
      <Popper placement={placement} referenceElement={referenceElement}>
        {({ ref, style, placement }) => (
          <div
            ref={ref}
            style={style}
            data-testid="placement"
            data-placement={placement}
          >
            {placement}
          </div>
        )}
      </Popper>
    );

    const { rerender, getByTestId } = render(<Component placement="top" />);

    expect(getByTestId('placement').textContent).toBe('top');

    await waitFor(() => rerender(<Component placement="bottom" />));

    expect(getByTestId('placement').textContent).toBe('bottom');
  });
});
