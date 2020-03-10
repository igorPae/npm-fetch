import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import RepoTree from "@/components/RepoTree.vue";
import sinon from "sinon";

let mockAxios;
let mockTreeItems;
let mockOut;

beforeEach(() => {
  mockTreeItems = { a: "A", b: "B" };
  mockOut = [
    {
      name: "a",
      children: []
    },
    {
      name: "b",
      children: []
    }
  ];

  mockAxios = {
    get: sinon
      .stub()
      .withArgs("http://localhost:3000/express")
      .returns(Promise.resolve({ data: mockTreeItems }))
  };
  RepoTree.__Rewire__("axios", mockAxios);
});

describe("RepoTree: Clicking", () => {
  it("Check api request and response empty", () => {
    const component = shallowMount(RepoTree);
    let treeInstance = component.vm;
    component.find(".tree_bt").vm.$emit("click");
    setImmediate(() => {
      expect(treeInstance.items.length).to.be.equal(0);
    });
  });

  it("Check api request and response valid", () => {
    const component = shallowMount(RepoTree, {
      propsData: { initKey: "express" }
    });
    let treeInstance = component.vm;
    component.find(".tree_bt").vm.$emit("click");
    setImmediate(() => {
      expect(JSON.stringify(treeInstance.items)).to.be.equal(
        JSON.stringify(mockOut)
      );
    });
  });
});
