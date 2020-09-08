/**
 * @prettier
 */

import React, { Component } from "react";

import ReactTable from "react-table";

import "./TokenPoolDetails.css";

class TokenPoolDetails extends Component {
  render() {
    const tokensList = this.props.tokensList;
    const explorerLink = "https://explorer.rsk.co/address/";

    var accruedFees = 0
      //this.props.myCollectedEthFees + this.props.myCollectedTokenFees;

    if (accruedFees.length === 0) {
      accruedFees = "-";
    }

    var rateDisplay =
      this.props.exchangeRate > 0
        ? ("1 ETH = " + this.props.exchangeRate.toFixed(4) + " " + this.props.curSymbol)
        : "-";

    let data = []
    for(const pair of this.props.pairsList) {

      data.push({
        pair: tokensList[pair.token0].symbol + ' - ' + tokensList[pair.token1].symbol,
        address: pair.address,
        addressLink: explorerLink + pair.address,
        poolSizeToken0: (pair.reserveToken0 / Math.pow(10,tokensList[pair.token0].decimals)).toFixed(4) + ' ' + tokensList[pair.token0].symbol,
        poolSizeToken1: (pair.reserveToken1 / Math.pow(10,tokensList[pair.token1].decimals)).toFixed(4) + ' ' + tokensList[pair.token1].symbol,
        poolShare: this.props.curPoolShare,
        accruedFees: accruedFees,
        rate: rateDisplay
      });
    };

    const columns = [
      {
        Header: "Pair",
        accessor: "pair",
        Cell: row => <b>{row.value}</b>,
        maxWidth: 100
      },
      {
        Header: "Address",
        accessor: "address",
        Cell: row => (
          <a href={row.original.addressLink} rel="noopener noreferrer" target="_blank">
            <div>{row.value}</div>
          </a>
        )
      },
      {
        Header: "Pool Size",
        accessor: "poolSizeToken0",
        className: "right"
      },
      {
        Header: "Pool Size",
        accessor: "poolSizeToken1",
        className: "right"
      },
      {
        Header: "Rate",
        accessor: "rate",
        className: "right"
      },
      {
        Header: "Your Share",
        accessor: "poolShare",
        className: "right"
      },
      {
        Header: "Your Fees",
        accessor: "accruedFees",
        className: "right"
      }
    ];

    return (
      <ReactTable
        className="TokenPoolDetails"
        data={data}
        minRows={1}
        showPagination={false}
        sortable={false}
        columns={columns}
        resizable={false}
      />
    );
  }
}

export default TokenPoolDetails;
